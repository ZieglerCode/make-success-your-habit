#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT=/data/bolt-projects
BACKUP_ROOT=/data/bolt-project-backups
RETENTION_DAYS=30

umask 077
install -d -m 700 "$BACKUP_ROOT"

for repository in "$PROJECT_ROOT"/*/repository/repo; do
  [ -d "$repository/.git" ] || continue

  slug=$(basename "$(dirname "$(dirname "$repository")")")

  if [[ ! "$slug" =~ ^[a-z0-9-]{1,48}$ ]]; then
    echo "Skipping repository with invalid project slug" >&2
    continue
  fi

  if ! git -c "safe.directory=$repository" -C "$repository" rev-parse --verify HEAD >/dev/null 2>&1; then
    continue
  fi

  project_backup_root="$BACKUP_ROOT/$slug"
  install -d -m 700 "$project_backup_root"
  timestamp=$(date -u +%Y%m%dT%H%M%SZ)
  temporary_bundle="$project_backup_root/.${timestamp}.bundle.tmp"
  final_bundle="$project_backup_root/${timestamp}.bundle"

  git -c "safe.directory=$repository" -C "$repository" bundle create "$temporary_bundle" --all
  mv "$temporary_bundle" "$final_bundle"
  chmod 600 "$final_bundle"
done

find "$BACKUP_ROOT" -type f -name '*.bundle' -mtime "+$RETENTION_DAYS" -delete
