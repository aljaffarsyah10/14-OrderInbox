#!/usr/bin/env bash
# ==============================================================================
# OrderInbox - Production Database Migration Script
# Safely runs Prisma migrations against the production database container.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "=========================================================="
echo " OrderInbox Production Database Migration"
echo " Time: $(date -Iseconds)"
echo "=========================================================="

cd "${ROOT_DIR}"

# Check if Docker compose app container is running
if docker compose ps app --status running -q 2>/dev/null | grep -q .; then
  echo "[*] Running migration inside existing 'app' container..."
  docker compose exec -T app npx prisma migrate deploy
  echo "[*] Checking migration status..."
  docker compose exec -T app npx prisma migrate status
else
  echo "[*] Running migration via temporary container runner..."
  docker compose run --rm --no-deps app npx prisma migrate deploy
  echo "[*] Checking migration status..."
  docker compose run --rm --no-deps app npx prisma migrate status
fi

echo "[+] SUCCESS: Production database migrations are up to date."
