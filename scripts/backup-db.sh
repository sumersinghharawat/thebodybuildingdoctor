#!/usr/bin/env bash
# Create a hosting-safe MySQL dump (no BINLOG/GTID privileged statements)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
set -a
# shellcheck disable=SC1091
source .env
set +a

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_DATABASE="${DB_DATABASE:?DB_DATABASE missing in .env}"
DB_USERNAME="${DB_USERNAME:?DB_USERNAME missing in .env}"

mkdir -p database/backups
STAMP=$(date +%Y%m%d_%H%M%S)
OUT="database/backups/${DB_DATABASE}_${STAMP}.sql"
TMP="${OUT}.tmp"

ARGS=(-h"$DB_HOST" -P"$DB_PORT" -u"$DB_USERNAME"
  --single-transaction --routines --triggers --add-drop-table
  --default-character-set=utf8mb4 --set-gtid-purged=OFF)

if [[ -n "${DB_PASSWORD:-}" ]]; then
  MYSQL_PWD="$DB_PASSWORD" mysqldump "${ARGS[@]}" "$DB_DATABASE" > "$TMP"
else
  mysqldump "${ARGS[@]}" "$DB_DATABASE" > "$TMP"
fi

perl -ne 'print unless /SQL_LOG_BIN|GTID_PURGED|MYSQLDUMP_TEMP_LOG_BIN/' "$TMP" > "$OUT"
rm -f "$TMP"

ls -lh "$OUT"
echo "Hosting-safe backup ready: $OUT"
