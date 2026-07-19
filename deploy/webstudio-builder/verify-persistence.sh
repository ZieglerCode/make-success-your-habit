#!/bin/sh
set -eu

cd /data/webstudio-builder

user_count() {
  docker exec webstudio-db psql \
    -U webstudio \
    -d webstudio \
    -tAc 'SELECT count(*) FROM "User"'
}

before=$(user_count)
docker compose --env-file .env restart

attempt=0
while [ "$attempt" -lt 30 ]; do
  status=$(docker inspect webstudio-db --format '{{.State.Health.Status}}' 2>/dev/null || true)
  if [ "$status" = "healthy" ]; then
    break
  fi
  attempt=$((attempt + 1))
  sleep 1
done

[ "${status:-}" = "healthy" ]
sleep 3

after=$(user_count)
schema=$(docker exec webstudio-db psql \
  -U webstudio \
  -d webstudio \
  -tAc 'SELECT to_regclass('\''public."Project"'\'') IS NOT NULL')

printf 'users_before=%s users_after=%s schema=%s\n' "$before" "$after" "$schema"
docker compose --env-file .env ps

printf 'db_public_ports='
docker port webstudio-db 2>/dev/null || true
printf 'postgrest_public_ports='
docker port webstudio-postgrest 2>/dev/null || true

rm -f /data/webstudio-builder/.pilot-access
test "$(stat -c %a /data/webstudio-builder/.env)" = "600"
