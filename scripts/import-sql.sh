#!/usr/bin/env bash
# Import a phpMyAdmin/MySQL dump into the local Laravel database from .env
# Usage: ./scripts/import-sql.sh pinkujqu_doctor.sql

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SQL_FILE="${1:-$ROOT/pinkujqu_doctor.sql}"

if [[ ! -f "$SQL_FILE" ]]; then
  echo "SQL file not found: $SQL_FILE"
  exit 1
fi

cd "$ROOT"
set -a
# shellcheck disable=SC1091
source .env
set +a

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_DATABASE="${DB_DATABASE:?DB_DATABASE missing in .env}"
DB_USERNAME="${DB_USERNAME:?DB_USERNAME missing in .env}"

MYSQL=(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USERNAME")
if [[ -n "${DB_PASSWORD:-}" ]]; then
  MYSQL+=(-p"$DB_PASSWORD")
fi

echo "Recreating database: $DB_DATABASE"
"${MYSQL[@]}" -e "DROP DATABASE IF EXISTS \`$DB_DATABASE\`; CREATE DATABASE \`$DB_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "Importing: $SQL_FILE"
"${MYSQL[@]}" "$DB_DATABASE" < "$SQL_FILE"

echo "Converting MyISAM tables to InnoDB (needed for Laravel foreign keys)..."
while IFS= read -r stmt; do
  [[ -z "$stmt" ]] && continue
  echo "  $stmt"
  "${MYSQL[@]}" "$DB_DATABASE" -e "$stmt"
done < <("${MYSQL[@]}" "$DB_DATABASE" -N -e "
SELECT CONCAT('ALTER TABLE \`', TABLE_NAME, '\` ENGINE=InnoDB;')
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND ENGINE = 'MyISAM';
")

echo "Running pending Laravel migrations..."
php artisan migrate --force

echo "Done."
php artisan tinker --execute="
echo 'users='.DB::table('users')->count().PHP_EOL;
echo 'courses='.DB::table('courses')->count().PHP_EOL;
echo 'lessons='.DB::table('lessons')->count().PHP_EOL;
echo 'blogs='.DB::table('blogs')->count().PHP_EOL;
"
