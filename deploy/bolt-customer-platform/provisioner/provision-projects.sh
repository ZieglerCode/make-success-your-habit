#!/usr/bin/env bash
set -uo pipefail

ROOT=/data/bolt-customer-platform
PROJECT_ROOT=/data/bolt-projects
TEMPLATE="$ROOT/provisioner/docker-compose.project.yml"
LOCK_FILE=/run/lock/bolt-project-provisioner.lock

exec 9>"$LOCK_FILE"
flock -n 9 || exit 0

container_env() {
  local key=$1
  docker inspect bolt-auth-db --format '{{range .Config.Env}}{{println .}}{{end}}' |
    sed -n "s/^${key}=//p" |
    head -n 1
}

POSTGRES_DB=$(container_env POSTGRES_DB)
POSTGRES_USER=$(container_env POSTGRES_USER)
POSTGRES_PASSWORD=$(container_env POSTGRES_PASSWORD)

if [ -z "$POSTGRES_DB" ] || [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ]; then
  echo "Could not read PostgreSQL credentials from bolt-auth-db" >&2
  exit 1
fi

install -d -m 700 "$PROJECT_ROOT"

query() {
  docker exec \
    -e PGPASSWORD="$POSTGRES_PASSWORD" \
    bolt-auth-db \
    psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" "$@"
}

pending_projects=$(query -At -F $'\t' -c \
  "SELECT id, slug, primary_host FROM projects WHERE provisioning_status = 'pending' ORDER BY created_at;")

while IFS=$'\t' read -r project_id slug project_host; do
  [ -n "${project_id:-}" ] || continue

  if [[ ! "$project_id" =~ ^[0-9a-f-]{36}$ ]] ||
     [[ ! "$slug" =~ ^[a-z0-9-]{1,48}$ ]] ||
     [[ ! "$project_host" =~ ^[a-z0-9-]+\.build\.mathishoffmann\.com$ ]]; then
    echo "Skipping invalid project record" >&2
    continue
  fi

  query -c \
    "UPDATE projects SET provisioning_status = 'provisioning', provisioning_error = NULL, updated_at = now() WHERE id = '$project_id';" \
    >/dev/null

  project_dir="$PROJECT_ROOT/$slug"
  install -d -m 700 "$project_dir"
  repository_dir="$project_dir/repository"
  install -d -m 700 -o 10001 -g 10001 "$repository_dir"
  printf 'PROJECT_SLUG=%s\nPROJECT_HOST=%s\nPROJECT_REPOSITORY_PATH=%s\nBOLT_PROJECT_IMAGE=bolt-diy:customer-persistence\nBOLT_STORAGE_IMAGE=bolt-project-storage:local\nDEFAULT_NUM_CTX=32768\n' \
    "$slug" "$project_host" "$repository_dir" >"$project_dir/.env"
  chmod 600 "$project_dir/.env"

  if docker compose \
    --project-name "bolt-project-$slug" \
    --env-file "$project_dir/.env" \
    -f "$TEMPLATE" \
    up -d; then
    container="bolt-project-$slug"
    storage_container="bolt-project-$slug-storage"
    ready=false
    for _ in $(seq 1 45); do
      health=$(docker inspect "$container" --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' 2>/dev/null || true)
      storage_health=$(docker inspect "$storage_container" --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' 2>/dev/null || true)
      if [ "$health" = healthy ] && [ "$storage_health" = healthy ]; then
        ready=true
        break
      fi
      if [ "$health" = exited ] || [ "$health" = dead ] ||
         [ "$storage_health" = exited ] || [ "$storage_health" = dead ]; then
        break
      fi
      sleep 2
    done

    if [ "$ready" = true ]; then
      query -c \
        "UPDATE projects SET provisioning_status = 'ready', provisioned_at = now(), provisioning_error = NULL, updated_at = now() WHERE id = '$project_id';" \
        >/dev/null
      query -c \
        "INSERT INTO audit_log (action, target_type, target_id, metadata) VALUES ('project.provisioned', 'project', '$project_id', jsonb_build_object('host', '$project_host'));" \
        >/dev/null
      continue
    fi
  fi

  error_message=$(docker logs --tail 20 "bolt-project-$slug" 2>&1 | tr '\n' ' ' | cut -c1-1000 | sed "s/'/''/g")
  query -c \
    "UPDATE projects SET provisioning_status = 'failed', provisioning_error = '$error_message', updated_at = now() WHERE id = '$project_id';" \
    >/dev/null
done <<<"$pending_projects"
