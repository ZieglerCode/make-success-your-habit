# Webstudio Identity, Acceptance, and Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Heike personal editing/publishing access, prove the complete system under real workflows, obtain joint acceptance, and switch production to the accepted Webstudio release with immediate rollback.

**Architecture:** Google OAuth creates Heike's personal Webstudio identity. A dedicated workspace containing only the MSYH project grants her `administrators` membership, which includes building and publishing without exposing reusable links. Preview acceptance precedes a gated production handover through the stable site router; the old Next.js container remains the legacy rollback upstream.

**Tech Stack:** Google OAuth 2.0, Webstudio PostgreSQL workspace authorization, Coolify/Traefik, Cloudflare DNS, Nginx stable router, browser-based acceptance tests, HTTP/SEO/visual test scripts.

## Global Constraints

- Heike's Webstudio identity is `heike.ziegler.sales@gmail.com`.
- Website contact copy remains `heike@heike-ziegler.com`; do not replace it with the login address.
- Do not share the Builder development-login secret or a reusable admin share link with Heike.
- Do not route production to Webstudio until the explicit acceptance checkpoint in Task 6 is approved by both parties.
- Keep the old application running, addressable on the private network, and backed up through the rollback window.
- All OAuth, Cloudflare, Builder, CMS, Publisher, and database credentials remain untracked and redacted.

---

### Task 1: Configure Google OAuth for the self-hosted Builder

**Files:**
- Update: `deploy/webstudio-builder/docker-compose.yml`
- Update: `deploy/webstudio-builder/.env.example`
- Update: `deploy/webstudio-builder/README.md`
- Create: `artifacts/migration/qa/google-oauth.md`

- [ ] **Step 1: Record pre-change identity state**

Back up Webstudio PostgreSQL. Record existing users, project workspace ID, and active sessions by IDs/counts only; do not export password/session secrets into artifacts.

- [ ] **Step 2: Create the Google OAuth web client**

Use the Google project controlled by the site owner. Configure authorized JavaScript origin `https://webstudio.mathishoffmann.com` and exact redirect URI `https://webstudio.mathishoffmann.com/auth/google/callback`. Set the consent screen and allow `heike.ziegler.sales@gmail.com` if the app remains in testing.

- [ ] **Step 3: Configure Builder secrets**

Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `/data/webstudio-builder/.env` with mode 0600 and pass them into the Builder service. Keep `DEV_LOGIN=true` for emergency owner access only.

- [ ] **Step 4: Restart Builder only and verify**

Verify owner emergency login still works, Google login button appears, callback has valid TLS/state cookies, and a denied Google identity receives no anonymous project access.

- [ ] **Step 5: Have Heike complete first Google login**

Heike signs in once with `heike.ziegler.sales@gmail.com`; verify exactly one Webstudio `User` row exists with that normalized email. She should initially see no MSYH project until membership is granted.

- [ ] **Step 6: Commit deployment wiring and sanitized evidence**

```bash
git add deploy/webstudio-builder/docker-compose.yml deploy/webstudio-builder/.env.example deploy/webstudio-builder/README.md artifacts/migration/qa/google-oauth.md
git commit -m "feat: enable google oauth for webstudio"
```

### Task 2: Grant project-scoped administrator access

**Files:**
- Create: `deploy/webstudio-builder/grant-msyh-admin.sql`
- Create: `deploy/webstudio-builder/verify-msyh-admin.sql`
- Update: `deploy/webstudio-builder/README.md`
- Create: `artifacts/migration/qa/heike-permissions.md`

- [ ] **Step 1: Write a transactional, guarded SQL grant**

The script locates project `1f94b07b-a3c3-4dac-a589-8ec0482337f1` and user email `heike.ziegler.sales@gmail.com`, aborts unless each resolves exactly once, and verifies the project's workspace contains no unrelated project. If it does, create a dedicated `Make Success Your Habit` workspace owned by the current project owner and move only this project into it. Upsert `WorkspaceMember` with `relation='administrators'` and `removedAt=NULL`.

- [ ] **Step 2: Write a read-only verification query**

Return user email, project ID/title, workspace ID/name, relation, and the number of projects in that workspace. Expected: Heike, the exact project ID, `administrators`, and project count 1.

- [ ] **Step 3: Test against a disposable database transaction**

Run the grant inside `BEGIN`; verify; `ROLLBACK`; prove wrong/missing/duplicate identities and multi-project workspaces fail safely.

- [ ] **Step 4: Apply to production Webstudio PostgreSQL**

Run once after backup, then execute the read-only verification. Revoke/delete the temporary migration administrator share token used by CLI if it is no longer required.

- [ ] **Step 5: Verify as Heike**

In a fresh browser profile, confirm she sees only the intended workspace/project, can open Builder, edit layout and text, create a section/page, access Publish, and cannot access server/Coolify/database secrets.

- [ ] **Step 6: Commit**

```bash
git add deploy/webstudio-builder/grant-msyh-admin.sql deploy/webstudio-builder/verify-msyh-admin.sql deploy/webstudio-builder/README.md artifacts/migration/qa/heike-permissions.md
git commit -m "ops: grant heike webstudio project administration"
```

### Task 3: Verify Heike's end-to-end editorial workflows

**Files:**
- Create: `artifacts/migration/qa/editorial-workflows.md`

- [ ] **Step 1: Webstudio text and layout test**

On preview, Heike changes a test text, replaces an image, changes section spacing, adds a section, creates a complete temporary page, checks tablet/mobile layout, publishes preview, and restores/deletes all test content. Verify no code or SSH is used.

- [ ] **Step 2: CMS blog test**

At `https://cms.heike-ziegler.com/admin`, Heike signs in with her separately delivered CMS credentials, creates an English draft, uploads/selects media, generates German, reviews both, schedules one test, publishes, edits, and archives it. Confirm translation begins and ends as a draft and overwrite requires confirmation.

- [ ] **Step 3: Dynamic site propagation test**

Verify only the published locale appears in its index/detail route, the other language switch points to its blog index until its counterpart publishes, both appear after publishing, and unpublishing immediately removes public access with 404 after cache expiry.

- [ ] **Step 4: Record usability issues and retest**

Fix only functional/usability blockers. Do not alter approved copy or design. Repeat the exact failed workflow and record pass evidence.

### Task 4: Run complete automated and manual preview QA

**Files:**
- Create: `scripts/migration/verify-preview.mjs`
- Create: `artifacts/migration/qa/http.json`
- Create: `artifacts/migration/qa/seo.json`
- Create: `artifacts/migration/qa/accessibility.md`
- Create: `artifacts/migration/qa/persistence-rollback.md`

- [ ] **Step 1: HTTP and content suite**

Test `/`, all 28 approved fixed localized routes (including both blog indexes), at least one real article per published locale, unknown static/blog routes, all redirects, downloads, embeds, and external links. Require correct status, destination, language, and key text hashes.

- [ ] **Step 2: SEO suite**

Validate unique titles/descriptions, canonical, reciprocal hreflang, x-default, OG fields, heading hierarchy, Article JSON-LD, sitemap completeness/exclusions, production-host `<loc>` values, and preview noindex/robots blocking.

- [ ] **Step 3: Visual suite**

Review full-page source/preview/diff images for every route at 1440, 1024, and 390 widths. Confirm typography, spacing, section order, colors, images, responsive navigation, overflow, and interactive states. List only measured accepted deviations.

- [ ] **Step 4: Accessibility and keyboard suite**

Test landmarks, headings, names/labels, focus order/visibility, menus, language switch, contrast, image alt, reduced motion, keyboard-only operation, and zoom/reflow.

- [ ] **Step 5: Failure, persistence, and rollback suite**

Restart Builder, CMS, Publisher, router, and active site containers one at a time; confirm persistent data and recovery. Force a bad candidate and prove active preview does not change. Publish two healthy builds, roll back, and verify the prior build ID/content.

- [ ] **Step 6: Security boundary suite**

Confirm Publisher/database/PostgREST have no public ports, public CMS API leaks no drafts/admin fields, unauthorized Builder/CMS requests fail, secrets are absent from logs/responses/assets/Git, and `.env` modes are 0600.

- [ ] **Step 7: Run repository verification and commit evidence**

Run every final verification command from the roadmap, then:

```bash
git add scripts/migration/verify-preview.mjs artifacts/migration/qa
git commit -m "test: verify webstudio preview acceptance candidate"
```

### Task 5: Prepare the reversible production handover without switching traffic

**Files:**
- Create: `deploy/webstudio-publisher/router/legacy-production.conf`
- Create: `deploy/webstudio-publisher/scripts/prepare-cutover.sh`
- Create: `deploy/webstudio-publisher/scripts/rollback-production.sh`
- Create: `artifacts/migration/cutover/runbook.md`

- [ ] **Step 1: Record the live production target**

Capture current Coolify application UUID, container/image ID, internal network name/alias, Traefik labels, Cloudflare record, TLS certificate state, health URL, and database/media backups. Redact secrets.

- [ ] **Step 2: Make the old app a routable legacy upstream**

Attach the old app to the private `msyh-releases` network with a stable alias `msyh-legacy-site`; do not remove its current public labels and do not switch public traffic.

- [ ] **Step 3: Preconfigure stable-router production state**

Prepare but do not enable the `www` Traefik router. Set Nginx production upstream initially to `msyh-legacy-site:3000`. Validate config and test through an internal Host-header request.

- [ ] **Step 4: Prepare the accepted Webstudio release**

Record the accepted build ID/image and run candidate health checks again. Create `/data/webstudio-publisher/state/production-enabled` only after Task 6 approval, not during preparation.

- [ ] **Step 5: Rehearse rollback commands internally**

The rollback script atomically points Nginx to `msyh-legacy-site`, validates/reloads, checks `www` through a forced local resolve, and never deletes either release.

### Task 6: Joint acceptance checkpoint — mandatory stop

**Files:**
- Create: `artifacts/migration/acceptance/acceptance.md`

- [ ] **Step 1: Present the candidate**

Provide `https://msyh-preview.mathishoffmann.com`, the accepted Webstudio build ID, QA summary, content/legal parity results, known deviations, Publisher failure/rollback proof, and Heike workflow results.

- [ ] **Step 2: Obtain two explicit approvals**

Record explicit approval from the site owner and Heike Ziegler with date/time and the exact build ID. A general prior implementation approval is not cutover approval.

- [ ] **Step 3: Stop if either approval is absent**

Do not create the production gate, remove old Traefik labels, change DNS, or attach `www` to the stable router. Address feedback on preview and repeat acceptance.

### Task 7: Cut over production after explicit approval

**Files:**
- Update: `artifacts/migration/acceptance/acceptance.md`
- Create: `artifacts/migration/cutover/result.md`

- [ ] **Step 1: Freeze and reverify**

Pause Builder/CMS editorial changes for the short cutover window, back up CMS/Webstudio again, verify accepted image ID, legacy health, router config, Cloudflare record, TLS, and rollback command.

- [ ] **Step 2: Enable the production gate and publish accepted build**

Create the mode-0600 `production-enabled` file containing accepted build ID, approval timestamp, and both approver names. Publish the exact accepted build to the production domain; reject any different build ID until a new acceptance record exists.

- [ ] **Step 3: Put the stable router in front of legacy first**

Remove the `www.heike-ziegler.com` Traefik rule from the old app and enable it on `msyh-site-router`, whose production upstream still points to `msyh-legacy-site`. Reload Traefik/Coolify configuration and verify the public site remains the old content through the router.

- [ ] **Step 4: Atomically switch Nginx to Webstudio**

Change only the production upstream to `msyh-release-{acceptedBuildId}`, validate, reload, and immediately run critical-route, TLS, CMS, sitemap, and asset tests. Cloudflare DNS remains unchanged if it already points to the same VPS; otherwise change only the required record and use forced-resolve tests before public propagation.

- [ ] **Step 5: Observe and decide**

Monitor 5xx, latency, CMS errors, asset failures, certificate state, and real browser checks for at least 30 minutes. Any critical failure invokes `rollback-production.sh` immediately; do not debug while broken production remains active.

- [ ] **Step 6: Record cutover and unfreeze**

Record final route, build/image IDs, timestamps, checks, and whether DNS changed. Re-enable normal editorial publishing after all checks pass.

- [ ] **Step 7: Commit sanitized evidence**

```bash
git add artifacts/migration/acceptance/acceptance.md artifacts/migration/cutover/result.md
git commit -m "ops: record accepted webstudio production cutover"
```

### Task 8: Maintain rollback readiness

**Files:**
- Update: `artifacts/migration/cutover/runbook.md`
- Update: `README.md`

- [ ] **Step 1: Retain both rollback targets**

Keep the old Next.js container/image, its database compatibility, and the previous healthy Webstudio release for at least 30 days after cutover. Do not delete backups or legacy routing metadata.

- [ ] **Step 2: Schedule rollback drills**

Within 24 hours and again before the retention window ends, switch an internal test Host between active/previous/legacy targets without public impact and record results.

- [ ] **Step 3: Define post-retention decision**

After 30 days, ask the owner before removing the legacy application. Retaining the previous Webstudio release remains part of routine Publisher operation.

- [ ] **Step 4: Commit operations documentation**

```bash
git add README.md artifacts/migration/cutover/runbook.md
git commit -m "docs: document webstudio rollback operations"
```
