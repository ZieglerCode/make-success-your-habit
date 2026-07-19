#!/bin/sh
set -eu

cd /data/webstudio-builder

docker compose --env-file .env ps
printf 'source_commit='
git -C src rev-parse HEAD
printf 'env_mode='
stat -c %a .env
printf 'users='
docker exec webstudio-db psql \
  -U webstudio \
  -d webstudio \
  -tAc 'SELECT count(*) FROM "User"'
printf 'project_table='
docker exec webstudio-db psql \
  -U webstudio \
  -d webstudio \
  -tAc 'SELECT to_regclass('\''public."Project"'\'') IS NOT NULL'
printf 'db_ports='
docker port webstudio-db 2>/dev/null || true
printf 'postgrest_ports='
docker port webstudio-postgrest 2>/dev/null || true
docker run --rm --entrypoint openssl webstudio-builder:pilot version
