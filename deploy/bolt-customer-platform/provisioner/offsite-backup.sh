#!/usr/bin/env bash
set -euo pipefail

PLATFORM_ROOT=/data/bolt-customer-platform
LOCAL_BACKUP_ROOT=/data/bolt-project-backups
STAGING_ROOT=/data/bolt-offsite-staging
DATABASE_DUMP="$STAGING_ROOT/bolt-auth.dump"
RESTIC_CACHE_DIR=${RESTIC_CACHE_DIR:-/data/bolt-restic-cache}

export RESTIC_CACHE_DIR

require_variable() {
  local name=$1

  if [ -z "${!name:-}" ]; then
    echo "$name is required" >&2
    exit 1
  fi
}

container_env() {
  local key=$1
  docker inspect bolt-auth-db --format '{{range .Config.Env}}{{println .}}{{end}}' |
    sed -n "s/^${key}=//p" |
    head -n 1
}

cleanup() {
  rm -f "$DATABASE_DUMP"
}

require_variable RESTIC_REPOSITORY
require_variable RESTIC_PASSWORD_FILE

if [ ! -r "$RESTIC_PASSWORD_FILE" ]; then
  echo "RESTIC_PASSWORD_FILE is not readable" >&2
  exit 1
fi

command -v restic >/dev/null
command -v docker >/dev/null

umask 077
install -d -m 700 "$STAGING_ROOT" "$RESTIC_CACHE_DIR"
trap cleanup EXIT

"$PLATFORM_ROOT/provisioner/backup-project-repositories.sh"

POSTGRES_DB=$(container_env POSTGRES_DB)
POSTGRES_USER=$(container_env POSTGRES_USER)

if [ -z "$POSTGRES_DB" ] || [ -z "$POSTGRES_USER" ]; then
  echo "Could not read PostgreSQL settings from bolt-auth-db" >&2
  exit 1
fi

docker exec bolt-auth-db \
  pg_dump \
  --format=custom \
  --no-owner \
  --no-privileges \
  --username="$POSTGRES_USER" \
  "$POSTGRES_DB" \
  >"$DATABASE_DUMP"

if ! restic cat config >/dev/null 2>&1; then
  if [ "${RESTIC_INIT_REPOSITORY:-false}" != true ]; then
    echo "Restic repository is unavailable or uninitialized." >&2
    echo "Set RESTIC_INIT_REPOSITORY=true for the first successful run." >&2
    exit 1
  fi

  restic init
fi

backup_sources=("$DATABASE_DUMP" "$PLATFORM_ROOT/README.md")

if [ -d "$LOCAL_BACKUP_ROOT" ]; then
  backup_sources+=("$LOCAL_BACKUP_ROOT")
fi

restic backup \
  --tag bolt-customer-platform \
  --host "$(hostname -f 2>/dev/null || hostname)" \
  "${backup_sources[@]}"

restic forget \
  --tag bolt-customer-platform \
  --keep-daily 14 \
  --keep-weekly 8 \
  --keep-monthly 12 \
  --prune

restic check
