# Webstudio Builder Pilot Deployment Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy a protected, persistent, fully self-hosted Webstudio Builder pilot at `https://webstudio.mathishoffmann.com` without changing or interrupting existing customer applications.

**Architecture:** Run the upstream Webstudio Builder, PostgreSQL 16, and PostgREST as an isolated Docker Compose stack. Expose only the Builder through the existing Coolify Traefik proxy; keep PostgreSQL and PostgREST on a private stack network. Bootstrap the database from Webstudio's versioned schema snapshot and use Webstudio's secret-based development login only for this private pilot.

**Tech Stack:** Webstudio Builder at pinned Git commit `1ef64506aaf3350f857fe2903ebdce3d0c033fe6`, Node.js 22, pnpm 9.14.4, PostgreSQL 16, PostgREST 12.2.12, Docker Compose, Coolify Traefik 3.6.

## Global Constraints

- Do not modify or restart existing Coolify applications.
- Do not reuse the existing `timeinvoiceapp` Supabase/PostgreSQL deployment.
- Do not expose PostgreSQL or PostgREST ports publicly.
- Store generated credentials only in mode-0600 `.env` files excluded from Git.
- Keep Webstudio pinned to commit `1ef64506aaf3350f857fe2903ebdce3d0c033fe6` until an upgrade is explicitly tested.
- Treat this as a protected pilot; do not promise production support or customer publishing yet.

---

### Task 1: Add reproducible deployment assets

**Files:**
- Create: `deploy/webstudio-builder/Dockerfile`
- Create: `deploy/webstudio-builder/docker-compose.yml`
- Create: `deploy/webstudio-builder/README.md`

**Interfaces:**
- Consumes: upstream Webstudio monorepo and `apps/builder/e2e/schema/current.sql`.
- Produces: a three-service Compose stack exposing Builder port 3000 only to the `coolify` network.

- [ ] **Step 1: Add the pinned Node build image**

```dockerfile
FROM node:22-bookworm-slim
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter=@webstudio-is/prisma-client generate
RUN pnpm --filter=@webstudio-is/builder build
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["pnpm", "--filter=@webstudio-is/builder", "start"]
```

- [ ] **Step 2: Add the isolated Compose stack**

The stack must contain `webstudio-db`, `webstudio-postgrest`, and `webstudio-builder`, a persistent `webstudio_db_data` volume, the internal `webstudio-internal` network, and the external `coolify` network. The Builder must carry Traefik HTTPS labels for `webstudio.mathishoffmann.com` and connect to PostgREST at `http://postgrest:3000`.

- [ ] **Step 3: Validate Compose syntax**

Run:

```bash
docker compose --env-file deploy/webstudio-builder/.env.example \
  -f deploy/webstudio-builder/docker-compose.yml config --quiet
```

Expected: exit code 0.

### Task 2: Stage source and secrets on the VPS

**Files:**
- Create remotely: `/data/webstudio-builder/.env`
- Create remotely: `/data/webstudio-builder/docker-compose.yml`
- Create remotely: `/data/webstudio-builder/src/Dockerfile.selfhost`

**Interfaces:**
- Consumes: local deployment assets and the pinned upstream commit.
- Produces: a server-side build context with credentials unavailable to Git.

- [ ] **Step 1: Clone and pin upstream source**

Run remotely:

```bash
git clone https://github.com/webstudio-is/webstudio.git /data/webstudio-builder/src
git -C /data/webstudio-builder/src checkout 1ef64506aaf3350f857fe2903ebdce3d0c033fe6
```

- [ ] **Step 2: Generate strong credentials**

Generate independent 32-byte random values for `POSTGRES_PASSWORD`, `AUTH_SECRET`, `AUTH_WS_CLIENT_SECRET`, and `TRPC_SERVER_API_TOKEN`; set `DEPLOYMENT_URL=https://webstudio.mathishoffmann.com`, `DEPLOYMENT_ENVIRONMENT=production`, and `DEV_LOGIN=true`. Set permissions to 0600.

- [ ] **Step 3: Verify secret-file permissions and Git pin**

Run remotely:

```bash
stat -c '%a %n' /data/webstudio-builder/.env
git -C /data/webstudio-builder/src rev-parse HEAD
```

Expected: `600 /data/webstudio-builder/.env` and commit `1ef64506aaf3350f857fe2903ebdce3d0c033fe6`.

### Task 3: Build and start the pilot

**Files:**
- Runtime state: Docker image `webstudio-builder:pilot`
- Runtime state: volume `webstudio_db_data`

**Interfaces:**
- Consumes: staged source, Compose definition, and `.env`.
- Produces: healthy Builder, PostgreSQL, and PostgREST containers.

- [ ] **Step 1: Build without touching existing stacks**

Run remotely:

```bash
docker compose --env-file /data/webstudio-builder/.env \
  -f /data/webstudio-builder/docker-compose.yml build builder
```

Expected: exit code 0 and image `webstudio-builder:pilot` present.

- [ ] **Step 2: Start only the Webstudio stack**

Run remotely:

```bash
docker compose --env-file /data/webstudio-builder/.env \
  -f /data/webstudio-builder/docker-compose.yml up -d
```

- [ ] **Step 3: Verify service health**

Run remotely:

```bash
docker compose --env-file /data/webstudio-builder/.env \
  -f /data/webstudio-builder/docker-compose.yml ps
docker logs --tail 100 webstudio-builder
```

Expected: database healthy, PostgREST running, Builder running without environment or schema errors.

### Task 4: Verify HTTPS, login, persistence, and isolation

**Files:**
- No file changes.

**Interfaces:**
- Consumes: running pilot.
- Produces: evidence that the deployment is reachable and private backend ports remain unexposed.

- [ ] **Step 1: Verify public HTTPS**

Run:

```bash
curl -fsSIL https://webstudio.mathishoffmann.com
```

Expected: a valid TLS connection and HTTP 200/302 response from Webstudio.

- [ ] **Step 2: Verify internal services are not published**

Run remotely:

```bash
docker port webstudio-db
docker port webstudio-postgrest
```

Expected: no output.

- [ ] **Step 3: Verify database persistence**

Restart only this stack and confirm the Webstudio `Project` table still exists:

```bash
docker compose --env-file /data/webstudio-builder/.env \
  -f /data/webstudio-builder/docker-compose.yml restart
docker exec webstudio-db psql -U webstudio -d webstudio \
  -tAc 'SELECT to_regclass('"'"'public."Project"'"'"') IS NOT NULL'
```

Expected: `t`.

### Task 5: Record operations and access handoff

**Files:**
- Update: `deploy/webstudio-builder/README.md`
- Create locally: `.env.webstudio.local`

**Interfaces:**
- Consumes: verified server deployment.
- Produces: repeatable update, backup, rollback, and login instructions.

- [ ] **Step 1: Store the pilot URL and login secret locally**

Copy only the user-facing Builder URL, pilot email, and login secret into `.env.webstudio.local`; set file permissions to 0600. The existing `.gitignore` pattern `.env*` must keep it untracked.

- [ ] **Step 2: Document backup and update commands**

Document PostgreSQL dump, volume inspection, pinned-source upgrade, image rebuild, log inspection, and full stack stop/start commands without embedding secrets.

- [ ] **Step 3: Run final verification**

Run the HTTPS check, container health check, database table check, and `git status --short` to prove that credentials remain untracked.
