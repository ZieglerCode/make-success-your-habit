# Webstudio Full Website Migration Roadmap

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved full Make Success Your Habit migration as four verifiable workstreams while keeping `www.heike-ziegler.com` on the existing application until joint acceptance.

**Architecture:** The self-hosted Webstudio Builder authors the bilingual visual site; the existing Next.js application remains the blog CMS and read-only content API; a private Publisher turns immutable Webstudio build IDs into versioned Docker releases; Coolify/Traefik exposes preview first and production only after a signed acceptance gate.

**Tech Stack:** Webstudio commit `1ef64506aaf3350f857fe2903ebdce3d0c033fe6`, Webstudio CLI `0.278.0`, Next.js 16, React 19, TypeScript, PostgreSQL/libSQL, Gemini, Node.js 22, Docker, Coolify Traefik, Cloudflare DNS, Google OAuth.

## Global Constraints

- The approved design in `docs/superpowers/specs/2026-07-19-webstudio-full-migration-design.md` is authoritative.
- Do not rewrite, shorten, optimize, restructure, or tone-adjust any source text.
- Translate only missing marketing-language counterparts; copy legal language only from the bilingual PDFs in `public/legal`.
- Never automatically publish a Gemini translation.
- Keep the current production route and application unchanged through preview and acceptance.
- Keep secrets out of Git, command output, public APIs, deployment errors, and screenshots.
- Make every database change backward-compatible with the currently deployed frontend.
- Use `superpowers:test-driven-development` for code changes, `pdf:pdf` for legal extraction, `browser:control-in-app-browser` for authenticated Builder work, and `build-web-apps:frontend-testing-debugging` for rendered-site verification.

---

## Workstream Order and Gates

### Gate 0: Baselines and backups

- [ ] Record `git rev-parse HEAD`, the active Coolify application UUID, active image/container IDs, current DNS records, and the Webstudio project/build IDs in `artifacts/migration/baseline/runtime.json`.
- [ ] Capture route/status/metadata/text hashes and screenshots of the current site at 1440×900, 1024×768, and 390×844 under `artifacts/migration/baseline/`.
- [ ] Back up the CMS database and uploads with `npm run backup`; dump Webstudio PostgreSQL and archive `/data/webstudio-builder/assets` on the VPS.
- [ ] Prove each backup is non-empty and record SHA-256 checksums in `artifacts/migration/backups/SHA256SUMS`.
- [ ] Commit only non-secret inventories and manifests; do not commit database dumps or private uploads.

### Workstream 1: CMS localization and translation

- [ ] Execute `docs/superpowers/plans/2026-07-19-webstudio-cms-localization-translation.md` completely.
- [ ] Gate: all CMS tests, `npm run lint`, and `npm run build` pass.
- [ ] Gate: the existing English post remains published and its German counterpart exists only as a draft.
- [ ] Gate: public APIs cannot return drafts, scheduled-future posts, translation diagnostics, or admin fields.

### Workstream 2: Publisher core and immutable releases

- [ ] Execute Tasks 1–5 of `docs/superpowers/plans/2026-07-19-webstudio-publisher.md` and deploy the private Publisher/router foundation from Task 6 without running the complete route-health integration proof yet.
- [ ] Gate: contract, authentication, state-machine, build-adapter, target, and failure-containment tests pass.
- [ ] Gate: Builder can reach the authenticated tRPC endpoint on the private network.

### Workstream 3: Webstudio site construction

- [ ] Execute Tasks 1–9 of `docs/superpowers/plans/2026-07-19-webstudio-site-migration.md` through the complete unpublished/Builder-preview project.
- [ ] Execute Task 6 integration proof of the Publisher plan, then Task 10 preview/parity verification of the site plan.
- [ ] Gate: all 28 fixed localized paths (including both blog indexes), both dynamic article patterns, `/`, and 404 behavior exist.
- [ ] Gate: a forced candidate failure leaves the active preview container and route unchanged; rollback restores the previous build ID without rebuilding.
- [ ] Gate: source-copy hashes and legal-document comparisons pass with no editorial change.
- [ ] Gate: screenshot comparisons have been manually reviewed at all three target widths.

### Workstream 4: Identity, integration, acceptance, and cutover

- [ ] Execute `docs/superpowers/plans/2026-07-19-webstudio-auth-qa-cutover.md` through the preview acceptance task.
- [ ] Stop before production DNS/routing changes and obtain explicit joint approval from the site owner and Heike.
- [ ] After approval, execute the cutover task, verify production, and retain the rollback target.

## Final Evidence Set

- [ ] `artifacts/migration/inventory/` contains machine-readable route, copy, link, media, metadata, and redirect inventories.
- [ ] `artifacts/migration/qa/` contains HTTP, SEO, accessibility, visual, CMS workflow, publisher failure, persistence, and rollback reports.
- [ ] `artifacts/migration/acceptance/acceptance.md` records the preview build ID, acceptance date, approvers, known accepted deviations, and production release ID.
- [ ] `artifacts/migration/cutover/` contains before/after DNS and route state with secrets removed.
- [ ] The repository contains no `.env.local`, token, password, database dump, private OAuth material, or Cloudflare credential.

## Final Verification

- [ ] Run `npm run test:content && npm run test:revisions && npm run test:maintenance && npm run test:backups && npm run test:uploads && npm run test:localization && npm run test:public-api && npm run test:translations`.
- [ ] Run `npm run lint && npm run build`.
- [ ] Run `npm --prefix deploy/webstudio-publisher test && npm --prefix deploy/webstudio-publisher run typecheck`.
- [ ] Run the preview smoke suite and the deliberate-failure/rollback suite documented in the Publisher plan.
- [ ] Run `git diff --check` and `git status --short`; inspect every changed path before committing.
