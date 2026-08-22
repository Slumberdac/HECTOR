#!/usr/bin/env bash
#
# Nightly database backup. Run from cron:
#   15 3 * * *  /home/YOUR_USER/HECTOR/ops/backup.sh >> ~/HECTOR/ops/backup.log 2>&1
#
# Dumps PostgreSQL rather than going through FerretDB. FerretDB stores the
# collections as DocumentDB tables in Postgres, so pg_dump captures everything
# including the indexes, and it does not depend on the wire-protocol layer being
# healthy at 3am. The tradeoff is that the dump is only restorable into another
# DocumentDB-enabled Postgres, not into MongoDB; see docs/MIGRATION.md if you
# ever need a portable export instead.
#
# Writes one compressed dump per run into ops/backups/ and prunes anything older
# than RETENTION_DAYS. Backups living on the same card as the data are not
# backups: copy them off the Pi as well.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${REPO_DIR}/ops/backups"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

cd "$REPO_DIR"

# shellcheck disable=SC1091
set -a && source .env && set +a

: "${POSTGRES_USER:?missing in .env}"

mkdir -p "$BACKUP_DIR"
stamp="$(date -u +%Y-%m-%dT%H%M%SZ)"
archive="${BACKUP_DIR}/hector-${stamp}.sql.gz"

echo "[$(date -u +%FT%TZ)] starting backup -> ${archive}"

# Streamed to stdout so nothing large is written inside the container. PGPASSWORD
# is passed through the environment rather than the command line, where it would
# show up in `ps` for every user on the box.
docker compose exec -T \
	-e PGPASSWORD="$POSTGRES_PASSWORD" \
	postgres pg_dump \
	--username "$POSTGRES_USER" \
	--dbname postgres \
	--format plain \
	--no-owner |
	gzip -9 >"$archive"

# A dump that failed halfway can still leave a small file behind; refuse to
# treat that as a good backup.
size="$(stat -c %s "$archive")"
if [ "$size" -lt 1024 ]; then
	echo "backup is only ${size} bytes, treating as failed" >&2
	rm -f "$archive"
	exit 1
fi

echo "[$(date -u +%FT%TZ)] wrote ${archive} ($(numfmt --to=iec "$size"))"

find "$BACKUP_DIR" -name 'hector-*.sql.gz' -mtime "+${RETENTION_DAYS}" -print -delete

echo "[$(date -u +%FT%TZ)] done"
