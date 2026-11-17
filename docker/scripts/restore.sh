#!/usr/bin/env bash
# ==============================================================================
# OrderInbox - Database Restore Script
# Restores a compressed or plain SQL dump into the PostgreSQL container.
# Usage: ./restore.sh <path_to_backup_file> [--force]
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <path_to_backup_file.sql.gz|path_to_backup.sql> [--force]" >&2
  exit 1
fi

BACKUP_FILE="$1"
FORCE="${2:-}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "[-] ERROR: File '${BACKUP_FILE}' does not exist!" >&2
  exit 1
fi

# Load Environment Variables
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

echo "=========================================================="
echo " OrderInbox Database Restore Utility"
echo " Target DB:  ${POSTGRES_DB} (User: ${POSTGRES_USER})"
echo " Container:  ${CONTAINER_NAME}"
echo " Source:     ${BACKUP_FILE}"
echo "=========================================================="

if [ "${FORCE}" != "--force" ] && [ "${FORCE}" != "-y" ]; then
  read -r -p "WARNING: This will overwrite data in '${POSTGRES_DB}'. Continue? (yes/NO): " CONFIRM
  if [ "${CONFIRM}" != "yes" ]; then
    echo "Restore aborted by user."
    exit 0
  fi
fi

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "[-] ERROR: Container ${CONTAINER_NAME} is not running!" >&2
  exit 1
fi

echo "[*] Restoring data into PostgreSQL..."

if [[ "${BACKUP_FILE}" == *.gz ]]; then
  gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"
else
  docker exec -i "${CONTAINER_NAME}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" < "${BACKUP_FILE}"
fi

echo "[+] SUCCESS: Database restored successfully from ${BACKUP_FILE}."
