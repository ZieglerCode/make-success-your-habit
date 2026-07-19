# Webstudio Publisher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Webstudio's Publish button deploy immutable, health-checked MSYH Docker releases to preview and, only after acceptance, production with atomic switching and rollback.

**Architecture:** A private Node tRPC service implements Webstudio's existing `deployment.publish`/`deployment.unpublish` interface. It uses Webstudio CLI `0.278.0` to sync the requested immutable build, generates the official React Router Docker export, builds a build-ID-tagged image, starts a candidate on the private `msyh-releases` network, tests it, and atomically reloads a stable Nginx route container. Durable JSON state records active and previous releases per target.

**Tech Stack:** Node.js 22, TypeScript, tRPC 10.45.2, Zod 4.4.3, Webstudio CLI 0.278.0, Docker Engine/Compose, Nginx Alpine, Coolify Traefik.

## Global Constraints

- The Publisher has no public Traefik labels and listens only on the private Coolify/Webstudio network.
- Authenticate every tRPC request with the Builder's `TRPC_SERVER_API_TOKEN` using constant-time comparison.
- Accept Builder origins only from `https://webstudio.mathishoffmann.com` and the private Builder URL.
- Serialize publish operations per target; never run two route switches for the same target concurrently.
- A failed sync, generation, build, start, health check, or reload must leave the active target unchanged.
- Never return commands, environment values, tokens, private paths, raw Docker output, or stack traces to the Builder.
- Production changes require the on-disk acceptance gate `/data/webstudio-publisher/state/production-enabled`.

---

### Task 1: Scaffold the private service and contract tests

**Files:**
- Create: `deploy/webstudio-publisher/package.json`
- Create: `deploy/webstudio-publisher/package-lock.json`
- Create: `deploy/webstudio-publisher/tsconfig.json`
- Create: `deploy/webstudio-publisher/src/contracts.ts`
- Create: `deploy/webstudio-publisher/src/config.ts`
- Create: `deploy/webstudio-publisher/test/contracts.test.ts`

- [ ] **Step 1: Write failing schema tests**

Reproduce the pinned Builder contract exactly: `publish` accepts `buildId`, `builderOrigin`, optional `githubSha`, `destination` (`saas|static`), `branchName`, and `logProjectName`; `unpublish` accepts `domain`; both return `{success:true}` or `{success:false,error:string}`. Reject unknown fields and malformed origins/build IDs.

- [ ] **Step 2: Run and confirm failure**

Run `npm --prefix deploy/webstudio-publisher test -- contracts.test.ts`.

- [ ] **Step 3: Implement schemas and configuration**

Require `TRPC_SERVER_API_TOKEN`, `WEBSTUDIO_SERVICE_TOKEN`, `BUILDER_ORIGIN`, `STATE_DIR`, `RELEASES_DIR`, `PREVIEW_DOMAIN=msyh-preview.mathishoffmann.com`, `PRODUCTION_DOMAIN=www.heike-ziegler.com`, `ROUTER_CONTAINER=msyh-site-router`, and bounded build/health timeouts. Validate at startup and redact config errors.

- [ ] **Step 4: Add scripts and dependencies**

Use `node --test --import tsx`, `tsc --noEmit`, and `tsx src/server.ts`. Pin dependency versions in the lockfile.

- [ ] **Step 5: Run tests and typecheck**

Run `npm --prefix deploy/webstudio-publisher test && npm --prefix deploy/webstudio-publisher run typecheck`.

- [ ] **Step 6: Commit**

```bash
git add deploy/webstudio-publisher/package.json deploy/webstudio-publisher/package-lock.json deploy/webstudio-publisher/tsconfig.json deploy/webstudio-publisher/src/contracts.ts deploy/webstudio-publisher/src/config.ts deploy/webstudio-publisher/test/contracts.test.ts
git commit -m "feat: define webstudio publisher contract"
```

### Task 2: Implement authenticated tRPC transport

**Files:**
- Create: `deploy/webstudio-publisher/src/auth.ts`
- Create: `deploy/webstudio-publisher/src/router.ts`
- Create: `deploy/webstudio-publisher/src/server.ts`
- Create: `deploy/webstudio-publisher/test/auth.test.ts`
- Create: `deploy/webstudio-publisher/test/router.test.ts`

- [ ] **Step 1: Write failing authentication tests**

Cover missing/wrong/Bearer-prefixed tokens, exact raw-token success (matching Webstudio client behavior), constant-length-independent rejection, POST-only handling, 1 MiB body limit, and sanitized errors.

- [ ] **Step 2: Implement the HTTP/tRPC server**

Use tRPC's standalone HTTP adapter at `/`; the Builder's `httpBatchLink` must be able to call `deployment.publish` and `deployment.unpublish`. Add request ID, JSON logs, a private `/healthz`, and graceful SIGTERM handling. Do not log the Authorization header or input object.

- [ ] **Step 3: Inject publish/unpublish handlers**

Keep router tests independent of Docker by injecting service functions. Map expected operational failures to `{success:false,error:"Deployment failed during the candidate health check."}` or another phase-specific allowlisted message rather than throwing internal errors to Webstudio.

- [ ] **Step 4: Run tests**

Run `npm --prefix deploy/webstudio-publisher test && npm --prefix deploy/webstudio-publisher run typecheck`.

- [ ] **Step 5: Commit**

```bash
git add deploy/webstudio-publisher/src/auth.ts deploy/webstudio-publisher/src/router.ts deploy/webstudio-publisher/src/server.ts deploy/webstudio-publisher/test/auth.test.ts deploy/webstudio-publisher/test/router.test.ts
git commit -m "feat: serve authenticated publisher trpc"
```

### Task 3: Sync and build immutable Webstudio releases

**Files:**
- Create: `deploy/webstudio-publisher/src/process-runner.ts`
- Create: `deploy/webstudio-publisher/src/bundle.ts`
- Create: `deploy/webstudio-publisher/src/release-builder.ts`
- Create: `deploy/webstudio-publisher/test/bundle.test.ts`
- Create: `deploy/webstudio-publisher/test/release-builder.test.ts`

- [ ] **Step 1: Write failing bundle/command-plan tests**

Given fixture `.webstudio/data.json`, extract deployment domains and project ID. Reject unknown domains and path-like build IDs. Assert command arguments are arrays, never shell strings, and secrets are passed through environment/stdin rather than interpolated into logs.

- [ ] **Step 2: Implement bounded process execution**

Use `spawn` with `shell:false`, timeout, maximum captured output, abort cleanup, and a redacted failure class. Permit only the fixed executables `webstudio`, `npm`, and `docker` with explicit argument builders.

- [ ] **Step 3: Implement CLI sync/generation**

For `/data/webstudio-publisher/releases/{buildId}/source`, run:

With `BUILD_ID` taken from the validated request and `WEBSTUDIO_SERVICE_TOKEN` read from the process environment, run the equivalent argument arrays:

```text
["webstudio","sync","--buildId",BUILD_ID,"--origin","https://webstudio.mathishoffmann.com","--authToken",WEBSTUDIO_SERVICE_TOKEN]
["webstudio","build","--template","docker"]
```

The Publisher image installs exactly `webstudio@0.278.0`. Before deployment work proceeds, run one compatibility proof against a disposable build ID; if CLI/server bundle negotiation fails, stop and align the CLI version rather than bypassing compatibility checks.

- [ ] **Step 4: Build the immutable image**

Run the argument array `["docker","build","--pull=false","--label","com.mathishoffmann.webstudio-build="+BUILD_ID,"--tag","msyh-webstudio-site:"+BUILD_ID,"."]`. Verify the resulting image label and ID. Persist only bounded build logs in `/data/webstudio-publisher/logs/{requestId}.log` with mode 0600.

- [ ] **Step 5: Run tests and a local fake-process integration test**

Run `npm --prefix deploy/webstudio-publisher test && npm --prefix deploy/webstudio-publisher run typecheck`.

- [ ] **Step 6: Commit**

```bash
git add deploy/webstudio-publisher/src/process-runner.ts deploy/webstudio-publisher/src/bundle.ts deploy/webstudio-publisher/src/release-builder.ts deploy/webstudio-publisher/test/bundle.test.ts deploy/webstudio-publisher/test/release-builder.test.ts
git commit -m "feat: build immutable webstudio releases"
```

### Task 4: Add candidate health checks and target resolution

**Files:**
- Create: `deploy/webstudio-publisher/src/targets.ts`
- Create: `deploy/webstudio-publisher/src/health-check.ts`
- Create: `deploy/webstudio-publisher/test/targets.test.ts`
- Create: `deploy/webstudio-publisher/test/health-check.test.ts`

- [ ] **Step 1: Write failing target tests**

Map only `msyh-preview.mathishoffmann.com` to `preview` and `www.heike-ziegler.com` to `production`. Reject production when the acceptance gate is missing. Reject builds that request unrelated domains. Static ZIP destinations are unsupported and return a bounded message.

- [ ] **Step 2: Write failing health-plan tests**

Require `/de`, `/en`, every offer route, every legal route, `/de/blog`, `/en/blog`, `/robots.txt`, and `/sitemap.xml`; add one published article URL for each locale returned by `https://cms.heike-ziegler.com/api/public/posts/sitemap`. Assert 2xx/3xx as specified, real 404 for a random blog slug, expected locale markers, and no `no available server` body.

- [ ] **Step 3: Implement candidate lifecycle**

Start `msyh-release-{buildId}` without Traefik labels on the private `msyh-releases` network, with restart policy and `DOMAINS` limited to preview/production. Poll its internal port until ready, then run checks directly against the candidate network address. Destroy only the candidate container on failure.

- [ ] **Step 4: Implement bounded CMS fallback behavior checks**

The health suite must distinguish an empty locale from CMS failure. If no published post exists for a locale, verify the empty index; if one exists, verify its dynamic route and structured article data.

- [ ] **Step 5: Run tests**

Run `npm --prefix deploy/webstudio-publisher test`.

- [ ] **Step 6: Commit**

```bash
git add deploy/webstudio-publisher/src/targets.ts deploy/webstudio-publisher/src/health-check.ts deploy/webstudio-publisher/test/targets.test.ts deploy/webstudio-publisher/test/health-check.test.ts
git commit -m "feat: verify webstudio candidate releases"
```

### Task 5: Implement atomic routing state and rollback

**Files:**
- Create: `deploy/webstudio-publisher/src/release-state.ts`
- Create: `deploy/webstudio-publisher/src/route-switcher.ts`
- Create: `deploy/webstudio-publisher/src/publish-service.ts`
- Create: `deploy/webstudio-publisher/test/release-state.test.ts`
- Create: `deploy/webstudio-publisher/test/publish-service.test.ts`
- Create: `deploy/webstudio-publisher/router/default.conf`

- [ ] **Step 1: Write failing state-machine tests**

Cover first publish, second publish, failed candidate, failed Nginx config validation, failed reload with restoration, rollback, unpublish preview, production-gate rejection, idempotent republish, and serialized concurrent requests.

- [ ] **Step 2: Implement durable target state**

Write `{target,activeBuildId,previousBuildId,updatedAt,health}` atomically using temp-file, fsync, and rename. Maintain separate `preview.json` and `production.json`; validate schema on every read.

- [ ] **Step 3: Implement the stable router switch**

Render complete Nginx upstream/server configuration to a temporary file, run `docker exec msyh-site-router nginx -t`, atomically rename, then `docker exec msyh-site-router nginx -s reload`. On any reload failure restore the prior file, validate, reload, and return failure. Preview and production upstreams change independently.

- [ ] **Step 4: Implement publish orchestration**

Sequence: validate → lock target → sync → build → start candidate → health check → route switch → persist state → retain previous healthy release → prune only releases older than the active/previous pair. `unpublish` may remove preview routing; production unpublish requires the acceptance gate plus an explicit configured allowance and is disabled by default.

- [ ] **Step 5: Run unit/integration tests**

Use fake Docker/Nginx adapters to prove the active state never advances before successful reload.

- [ ] **Step 6: Commit**

```bash
git add deploy/webstudio-publisher/src/release-state.ts deploy/webstudio-publisher/src/route-switcher.ts deploy/webstudio-publisher/src/publish-service.ts deploy/webstudio-publisher/test/release-state.test.ts deploy/webstudio-publisher/test/publish-service.test.ts deploy/webstudio-publisher/router/default.conf
git commit -m "feat: switch and roll back webstudio releases"
```

### Task 6: Package and deploy Publisher plus stable router

**Files:**
- Create: `deploy/webstudio-publisher/Dockerfile`
- Create: `deploy/webstudio-publisher/docker-compose.yml`
- Create: `deploy/webstudio-publisher/.env.example`
- Create: `deploy/webstudio-publisher/README.md`
- Create: `deploy/webstudio-publisher/scripts/verify.sh`
- Update: `deploy/webstudio-builder/docker-compose.yml`
- Update: `deploy/webstudio-builder/.env.example`
- Update: `deploy/webstudio-builder/README.md`

- [ ] **Step 1: Build a least-exposed service image**

Use Node 22, install locked production dependencies and Webstudio CLI 0.278.0, install Docker CLI only, run as a dedicated UID except for the narrowly required Docker socket group, expose port 3001 internally, and include a container health check.

- [ ] **Step 2: Define Compose services and volumes**

Add `webstudio-publisher` and `msyh-site-router`; mount `/var/run/docker.sock`, release/log/state directories, and router configuration. Connect Publisher to `webstudio-internal` and `msyh-releases`; connect router to `coolify` and `msyh-releases`. Add Traefik labels for preview only. Do not add `www.heike-ziegler.com` yet.

- [ ] **Step 3: Connect Builder to Publisher**

Set `TRPC_SERVER_URL=http://webstudio-publisher:3001`, use the same strong `TRPC_SERVER_API_TOKEN`, retain `BUILDER_ORIGIN=https://webstudio.mathishoffmann.com`, and restart only the Webstudio stack.

- [ ] **Step 4: Validate definitions before deployment**

Run `docker compose --env-file deploy/webstudio-publisher/.env.example -f deploy/webstudio-publisher/docker-compose.yml config --quiet` and the Builder equivalent.

- [ ] **Step 5: Deploy and run real integration proof**

Publish a preview build from Builder. Confirm request authentication, build-ID image label, candidate health evidence, Nginx active upstream, valid TLS at `https://msyh-preview.mathishoffmann.com`, and Publisher absence from public ports.

- [ ] **Step 6: Prove failure containment and rollback**

Publish a test build with a deliberately failing health marker; confirm preview remains on the former build. Publish a healthy second build, run rollback, and confirm the first build returns without rebuild.

- [ ] **Step 7: Commit deployment assets and sanitized evidence**

```bash
git add deploy/webstudio-publisher deploy/webstudio-builder/docker-compose.yml deploy/webstudio-builder/.env.example deploy/webstudio-builder/README.md artifacts/migration/qa/publisher.md
git commit -m "ops: deploy webstudio publisher and release router"
```
