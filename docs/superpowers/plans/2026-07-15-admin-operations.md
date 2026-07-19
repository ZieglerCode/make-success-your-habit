# Admin Operations and Backups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Guarantee scheduled publishing, record maintenance health, and create verified 14-day Coolify backups with guarded restore tooling.

**Architecture:** Authenticated maintenance routes call idempotent store functions and write run records. Standalone Node scripts invoke provider tools and filesystem archives, producing atomic checksummed backup directories consumed by a guarded restore script.

**Tech Stack:** Next.js, Postgres/LibSQL, Node child processes and filesystem, pg_dump/pg_restore, tar, Coolify scheduled tasks.

## Global Constraints

- Production maintenance requests require `MAINTENANCE_SECRET`.
- Scheduler runs every minute; backup runs daily; retention is 14 days.
- Restore is CLI-only and requires `CONFIRM_RESTORE=restore-content`.
- Keep request-triggered publishing as fallback.

---

### Task 1: Export idempotent scheduled publishing

**Files:** Modify `lib/content-store.ts`, create `scripts/test-scheduled-publishing.ts`.

**Interfaces:** Produces `publishDueScheduledPosts(now?: Date): Promise<number>`.

- [ ] Write tests for before-due, due, already-published, null date, and repeat invocation.
- [ ] Verify RED because the function is private and returns nothing.
- [ ] Export it, parameterize time, and return affected row count for both providers.
- [ ] Preserve calls from list/get functions.
- [ ] Verify GREEN.

### Task 2: Record maintenance runs

**Files:** Create `lib/maintenance-store.ts`, create `scripts/test-maintenance-store.ts`, modify database initialization.

**Interfaces:** Produces `startMaintenanceRun`, `finishMaintenanceRun`, `failMaintenanceRun`, `maintenanceStatus`, and atomic lock acquisition.

- [ ] Write store tests for success, failure sanitization, overlapping-run rejection, latest-by-type, and 90-day pruning.
- [ ] Add `maintenance_runs` schema and indexes to both providers.
- [ ] Implement atomic running-row lock and normalized status records.
- [ ] Run tests.

### Task 3: Add protected maintenance routes

**Files:** Create `lib/maintenance-auth.ts`, `app/api/maintenance/publish-scheduled/route.ts`, `app/api/maintenance/status/route.ts`, `scripts/test-maintenance-auth.ts`.

**Interfaces:** Bearer-secret POST publisher and admin-session GET status.

- [ ] Write RED secret parsing tests using `timingSafeEqual` expectations and missing-production-secret behavior.
- [ ] Implement constant-time bearer comparison.
- [ ] Wrap publishing in run start/finish/fail records; overlap returns `409` and success returns published count/duration.
- [ ] Status route requires current admin and returns stale flags.
- [ ] Run focused tests and TypeScript.

### Task 4: Build atomic backup tooling

**Files:** Create `scripts/backup-content.mjs`, `scripts/restore-content.mjs`, `scripts/test-backup-utils.ts`, `lib/backup-utils.ts`; modify `Dockerfile`, `package.json`.

**Interfaces:** Backup root from `BACKUP_DIR` default `/app/backups`; uploads from `UPLOAD_DIR`; exact manifest schema version 1.

- [ ] Write utility tests for UTC directory naming, SHA-256, 14-day retention while preserving newest, stale-temp cleanup, and manifest validation.
- [ ] Implement utilities and verify GREEN.
- [ ] Implement backup script: create `.tmp-*`, run `pg_dump --format=custom --file`, run `tar -czf`, hash both, write manifest, atomically rename, prune retention, exit nonzero on failure.
- [ ] Add LibSQL file-copy branch; reject Turso with a clear provider message.
- [ ] Implement restore script: validate confirmation, manifest and hashes, extract uploads to sibling temp, run `pg_restore --clean --if-exists`, then atomically replace upload directory.
- [ ] Add `postgresql-client` and `tar` in Docker runner and scripts `backup`/`restore` in package.json.
- [ ] Test with temporary directories and a dry-run command adapter; run Docker build.

### Task 5: Show operational health in Admin Settings

**Files:** Create `components/admin-operations-status.tsx`, modify `app/admin/settings/page.tsx`.

**Interfaces:** Server page reads `maintenanceStatus()` and filesystem backup manifest without exposing secrets.

- [ ] Add cards for scheduler, last publication count, backup age, provider, upload storage, and backup volume.
- [ ] Mark scheduler stale after five minutes and backup stale after 36 hours.
- [ ] Show exact corrective Coolify command without rendering secret values.
- [ ] Browser-test healthy, stale, missing-backup, and failure states on desktop/mobile.

### Task 6: Document Coolify jobs and restore runbook

**Files:** Modify `COOLIFY.md`, `README.md`, `.env.example`.

- [ ] Document `backups:/app/backups`, `MAINTENANCE_SECRET`, one-minute authenticated curl command, daily `npm run backup`, retention, health verification, and guarded restore steps.
- [ ] Confirm no real secrets or production dump files enter Git.
- [ ] Run all tests, TypeScript, production build, Docker build, `git diff --check`, and browser QA.
