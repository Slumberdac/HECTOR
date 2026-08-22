#!/usr/bin/env bash
#
# Nightly MongoDB backup. Run from cron:
#   15 3 * * *  /home/YOUR_USER/HECTOR/ops/backup.sh >> ~/HECTOR/ops/backup.log 2>&1
#
# Writes a compressed archive per day into ops/backups/ and prunes anything
# older than RETENTION_DAYS. Backups living on the same card as the data are not
# backups — copy them off the Pi as well.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${REPO_DIR}/ops/backups"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

cd "$REPO_DIR"

# shellcheck disable=SC1091
set -a && source .env && set +a

: "${MONGO_ROOT_USERNAME:?missing in .env}"
: "${MONGO_ROOT_PASSWORD:?missing in .env}"

mkdir -p "$BACKUP_DIR"
stamp="$(date -u +%Y-%m-%dT%H%M%SZ)"
archive="${BACKUP_DIR}/hector-${stamp}.archive.gz"

echo "[$(date -u +%FT%TZ)] starting backup -> ${archive}"

# --archive to stdout so nothing large is written inside the container.
docker compose exec -T mongo mongodump \
	--username "$MONGO_ROOT_USERNAME" \
	--password "$MONGO_ROOT_PASSWORD" \
	--authenticationDatabase admin \
	--db hector \
	--archive \
	--gzip > "$archive"

# A dump that failed halfway can still leave a small file behind; refuse to
# treat that as a good backup.
size="$(stat -c %s "$archive")"
if [ "$size" -lt 1024 ]; then
	echo "backup is only ${size} bytes, treating as failed" >&2
	rm -f "$archive"
	exit 1
fi

echo "[$(date -u +%FT%TZ)] wrote ${archive} ($(numfmt --to=iec "$size"))"

find "$BACKUP_DIR" -name 'hector-*.archive.gz' -mtime "+${RETENTION_DAYS}" -print -delete

echo "[$(date -u +%FT%TZ)] done"
