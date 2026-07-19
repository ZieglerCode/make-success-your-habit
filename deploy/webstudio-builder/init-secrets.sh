#!/bin/sh
set -eu

deployment_dir=${1:-/data/webstudio-builder}
env_file="$deployment_dir/.env"
access_file="$deployment_dir/.pilot-access"

if [ -e "$env_file" ]; then
  echo "Refusing to replace existing $env_file" >&2
  exit 1
fi

umask 077

postgres_password=$(openssl rand -hex 32)
auth_secret=$(openssl rand -hex 32)
auth_ws_client_secret=$(openssl rand -hex 32)
trpc_server_api_token=$(openssl rand -hex 32)

{
  printf '%s\n' 'WEBSTUDIO_DOMAIN=webstudio.mathishoffmann.com'
  printf '%s\n' 'PUBLISHER_HOST=sites.mathishoffmann.com'
  printf '%s\n' 'POSTGRES_DB=webstudio'
  printf '%s\n' 'POSTGRES_USER=webstudio'
  printf 'POSTGRES_PASSWORD=%s\n' "$postgres_password"
  printf 'AUTH_SECRET=%s\n' "$auth_secret"
  printf '%s\n' 'AUTH_WS_CLIENT_ID=selfhost-webstudio'
  printf 'AUTH_WS_CLIENT_SECRET=%s\n' "$auth_ws_client_secret"
  printf 'TRPC_SERVER_API_TOKEN=%s\n' "$trpc_server_api_token"
  printf '%s\n' 'PLANS=[{"name":"Pro","features":{"canDownloadAssets":true,"canRestoreBackups":true,"allowAdditionalPermissions":true,"allowDynamicData":true,"allowAuth":true,"allowContentMode":true,"allowStagingPublish":false,"maxContactEmailsPerProject":5,"maxDomainsAllowedPerUser":20,"maxDailyPublishesPerUser":20,"maxProjectsAllowedPerUser":50,"maxAssetsPerProject":350}}]'
} >"$env_file"

{
  printf '%s\n' 'WEBSTUDIO_URL=https://webstudio.mathishoffmann.com'
  printf '%s\n' 'WEBSTUDIO_PILOT_EMAIL=admin@mathishoffmann.com'
  printf 'WEBSTUDIO_LOGIN_SECRET=%s\n' "$auth_secret"
} >"$access_file"

chmod 600 "$env_file" "$access_file"
