#!/usr/bin/env bash
# ==============================================================================
# OrderInbox - Automated PostgreSQL Database Backup Script
# Creates a compressed, timestamped pg_dump and applies retention policy.
# ==============================================================================

set -euo pipefail

# 1. Resolve paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-${ROOT_DIR}/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

# 2. Load Environment Variables
if [ -f "${ROOT_DIR}/.env.production" ]; then
  # shellcheck disable=SC1091
  set -a
  source "${ROOT_DIR}/.env.production"
  set +a
elif [ -f "${ROOT_DIR}/.env" ]; then
  set -a
  source "${ROOT_DIR}/.env"
  set +a
fi

POSTGRES_USER="${POSTGRES_USER:-orderinbox}"
POSTGRES_DB="${POSTGRES_DB:-orderinbox_prod}"
CONTAINER_NAME="${POSTGRES_CONTAINER:-orderinbox-postgres}"

TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
BACKUP_FILENAME="orderinbox_backup_${TIMESTAMP}.sql.gz"
BACKUP_FILEPATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

echo "=========================================================="
echo " Starting OrderInbox Database Backup [$(date -Iseconds)]"
echo " Target DB: ${POSTGRES_DB} (User: ${POSTGRES_USER})"
echo " Output:    ${BACKUP_FILEPATH}"
echo "=========================================================="

# 3. Create destination directory
mkdir -p "${BACKUP_DIR}"

# 4. Perform PostgreSQL Dump via Docker
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "[-] ERROR: Container ${CONTAINER_NAME} is not running!" >&2
  exit 1
fi

echo "[*] Streaming database dump and compressing with gzip..."
docker exec -t "${CONTAINER_NAME}" pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" | gzip -9 > "${BACKUP_FILEPATH}"

# 5. Verify Archive Integrity
if gzip -t "${BACKUP_FILEPATH}" 2>/dev/null; then
  BACKUP_SIZE="$(du -h "${BACKUP_FILEPATH}" | cut -f1)"
  echo "[+] SUCCESS: Backup verified successfully (${BACKUP_SIZE}) at ${BACKUP_FILEPATH}"
else
  echo "[-] ERROR: Backup file failed integrity test!" >&2
  rm -f "${BACKUP_FILEPATH}"
  exit 1
fi

# 6. Apply Retention Policy (remove backups older than RETENTION_DAYS)
echo "[*] Cleaning up backups older than ${RETENTION_DAYS} days in ${BACKUP_DIR}..."
find "${BACKUP_DIR}" -type f -name "orderinbox_backup_*.sql.gz" -mtime "+${RETENTION_DAYS}" -exec rm -v {} \;

echo "[+] Backup process completed cleanly."
