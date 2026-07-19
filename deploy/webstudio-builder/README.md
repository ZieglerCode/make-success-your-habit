# Webstudio Builder Pilot

This directory contains the reproducible deployment definition for the protected Webstudio Builder pilot at `https://webstudio.mathishoffmann.com`.

The deployed stack is intentionally pinned to upstream commit `1ef64506aaf3350f857fe2903ebdce3d0c033fe6`. PostgreSQL and PostgREST are reachable only on the private `webstudio_internal` network. Only the Builder joins the existing external `coolify` network for Traefik routing.

Project editors run on isolated hosts matching `p-<project-id>.webstudio.mathishoffmann.com`. The Coolify Traefik proxy routes those hosts to the Builder and uses a Let's Encrypt certificate for both `webstudio.mathishoffmann.com` and `*.webstudio.mathishoffmann.com`. The wildcard certificate is issued and renewed through a dedicated Cloudflare DNS-01 resolver.

## Server layout

- Deployment root: `/data/webstudio-builder`
- Upstream source: `/data/webstudio-builder/src`
- Secret configuration: `/data/webstudio-builder/.env` (mode 0600)
- Database volume: `webstudio_db_data`
- Asset volume: `webstudio_assets`
- Staged-upload volume: `webstudio_staged_uploads`
- Cloudflare token on the workstation: `.env.cloudflare.local` (ignored by Git, mode 0600)
- Cloudflare token on the VPS: `/data/coolify/proxy/cloudflare_dns_api_token` (mode 0600, mounted as a Docker secret)
- Wildcard ACME state: `/data/coolify/proxy/acme-cloudflare.json` (mode 0600)

## Wildcard TLS

The proxy service defines the `cloudflare` ACME resolver with DNS-01 and reads the same restricted token through both `CF_DNS_API_TOKEN_FILE` and `CF_ZONE_API_TOKEN_FILE`. The token is scoped to `mathishoffmann.com` with only `Zone:Read` and `DNS:Edit` permissions. Do not replace it with a Cloudflare Global API Key.

The Builder labels contain separate `webstudio-project-http` and `webstudio-project-https` routers. The HTTPS router explicitly requests these certificate domains:

```text
webstudio.mathishoffmann.com
*.webstudio.mathishoffmann.com
```

Before editing `/data/coolify/proxy/docker-compose.yml`, create a timestamped backup. If Coolify regenerates its proxy compose file during a future proxy reconfiguration, restore the `cloudflare` resolver, Docker secret mount, and environment entries before recreating the proxy.

## Operations

All commands run on the VPS as root.

```bash
cd /data/webstudio-builder
docker compose --env-file .env ps
docker compose --env-file .env logs --tail 200 builder
docker compose --env-file .env restart builder
docker compose --env-file .env stop
docker compose --env-file .env start
```

## Database backup

```bash
cd /data/webstudio-builder
set -a
. ./.env
set +a
docker exec webstudio-db pg_dump \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --format=custom \
  --file=/tmp/webstudio.dump
docker cp webstudio-db:/tmp/webstudio.dump ./webstudio-$(date +%Y%m%d-%H%M%S).dump
```

Back up `webstudio_assets` separately before upgrades. Staged uploads are disposable once imports finish.

## Controlled upgrade

Never pull and redeploy `main` directly. Record a reviewed commit, back up database and assets, then run:

```bash
cd /data/webstudio-builder/src
git fetch origin
git checkout <reviewed-commit>
cd ..
docker compose --env-file .env build builder
docker compose --env-file .env up -d builder
```

If the Builder does not become healthy, check logs and return to the previously recorded commit before rebuilding.

## Current pilot limitations

- Secret-based pilot login is enabled; OAuth and customer invitations are not configured.
- Webstudio Cloud publishing is not used.
- Customer-domain publishing to separate Coolify applications is not implemented yet.
- This is a validation deployment, not yet the final multi-tenant agency platform.
