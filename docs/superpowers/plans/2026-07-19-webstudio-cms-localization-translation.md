# Webstudio CMS Localization and Translation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing CMS with independent DE/EN post records, safe Gemini-generated draft translations, and a minimal read-only localized API for the Webstudio site.

**Architecture:** Each localized post is a first-class row identified by `locale` and linked through `translationGroupId`. A translation service validates structured Gemini output before an atomic create/update of a target draft. Separate `/api/public/...` routes expose only published fields and never share the context-sensitive admin endpoint.

**Tech Stack:** Next.js 16 Route Handlers, TypeScript, PostgreSQL/libSQL, `@google/genai`, Zod, Node `assert`, existing CMS authentication and revision system.

## Global Constraints

- Preserve all existing post values and IDs; backfill the current post as English.
- Do not change the current public frontend behavior while it remains in production.
- Never send legal documents, user data, credentials, revision history, or model diagnostics to Gemini.
- Gemini output is always stored as `draft`; publishing remains a separate authenticated action.
- Regeneration may overwrite a non-empty target only after explicit confirmation from the UI and server request.
- Public routes must select `status = published` and `publishedAt <= now` in storage, not only filter after loading.

---

### Task 1: Add localization contracts with failing tests

**Files:**
- Create: `lib/blog-localization.ts`
- Create: `scripts/test-blog-localization.ts`
- Update: `package.json`

- [ ] **Step 1: Write the failing contract test**

Test `parseLocale`, `otherLocale`, `translationState`, localized slug keys, and public response serialization. Assert only `de` and `en` are accepted; defaulting is allowed only in the database backfill, never on a public route parameter.

- [ ] **Step 2: Run the new test and confirm failure**

Run `npx tsx scripts/test-blog-localization.ts`.

Expected: module-not-found or missing-export failure for `lib/blog-localization.ts`.

- [ ] **Step 3: Implement the minimal types and validators**

Export `BlogLocale = "de" | "en"`, `TranslationStatus = "none" | "translating" | "ready" | "failed"`, `parseBlogLocale`, `oppositeBlogLocale`, and a `toPublicPost` serializer with an explicit allowlist.

- [ ] **Step 4: Add `test:localization` and rerun**

Add `"test:localization": "tsx scripts/test-blog-localization.ts"` and run it to green.

- [ ] **Step 5: Commit**

```bash
git add lib/blog-localization.ts scripts/test-blog-localization.ts package.json package-lock.json
git commit -m "feat: define localized blog contracts"
```

### Task 2: Migrate the post store without data loss

**Files:**
- Update: `lib/content-store.ts`
- Update: `lib/post-revisions.ts`
- Update: `scripts/test-post-revisions.ts`
- Create: `scripts/test-content-localization.ts`
- Update: `package.json`

- [ ] **Step 1: Write failing migration and query tests**

Using a temporary libSQL database, first create a legacy `posts` table and row, then initialize the current store. Assert the row becomes `locale="en"`, receives its own `translationGroupId`, has `translationStatus="none"`, and remains published. Assert `(locale, slug)` lookup and locale-filtered pagination. Assert drafts and future scheduled rows never appear in published queries.

- [ ] **Step 2: Run and confirm the expected failures**

Run `npx tsx scripts/test-content-localization.ts`.

Expected: missing localization fields/query arguments.

- [ ] **Step 3: Extend `BlogPost` and input contracts**

Add `locale`, `translationGroupId`, `sourcePostId`, `translationStatus`, `translationError`, and `translationUpdatedAt`. Add locale to `ListPostsOptions`; add storage functions `getPublishedPostByLocaleSlug`, `getTranslationCounterpart`, and `listPublishedPostSitemapEntries`.

- [ ] **Step 4: Add backward-compatible columns and indexes**

In both providers, add missing columns with guarded `ALTER TABLE`; backfill existing rows to English; generate one group ID per ungrouped row; add indexes on `(locale,status,publishedAt)`, `(locale,slug)`, and `translationGroupId`. Keep the legacy global slug uniqueness during this migration because localized slugs are independent and may differ; validate uniqueness as `(locale,slug)` in application code so a later table rebuild can safely remove the legacy constraint.

- [ ] **Step 5: Include localization fields in revisions**

Extend revision snapshots and restore behavior so restoring content never severs a translation group or silently changes locale. Translation diagnostics are not revision content.

- [ ] **Step 6: Run all affected tests**

Run `npm run test:localization && npx tsx scripts/test-content-localization.ts && npm run test:revisions && npm run test:content`.

- [ ] **Step 7: Commit**

```bash
git add lib/content-store.ts lib/post-revisions.ts scripts/test-content-localization.ts scripts/test-post-revisions.ts package.json package-lock.json
git commit -m "feat: persist localized blog records"
```

### Task 3: Build the public localized read API

**Files:**
- Create: `lib/public-blog-api.ts`
- Create: `app/api/public/posts/route.ts`
- Create: `app/api/public/posts/[locale]/[slug]/route.ts`
- Create: `app/api/public/posts/sitemap/route.ts`
- Create: `app/api/public/sitemap.xml/route.ts`
- Create: `scripts/test-public-blog-api.ts`
- Update: `package.json`

- [ ] **Step 1: Write failing serializer and authorization-boundary tests**

Assert list pagination clamps `limit` to 1–50, invalid locales return 400, unknown/unpublished slugs return 404, and responses exclude `translationError`, `sourcePostId`, revisions, scheduling details, and admin data. Assert counterpart metadata is null unless the paired article is published.

- [ ] **Step 2: Run and confirm failure**

Run `npx tsx scripts/test-public-blog-api.ts`.

- [ ] **Step 3: Implement pure request parsing and response shaping**

Return `{items,page,pageSize,total,nextPage}` for lists, one public article plus optional `{locale,slug}` counterpart for detail, and `{items:[{locale,slug,updatedAt}]}` for Publisher health checks. Generate `/api/public/sitemap.xml` from the approved static localized route constants plus published blog entries; every `<loc>` uses `https://www.heike-ziegler.com`. Set `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` and `Vary: Accept-Encoding`.

- [ ] **Step 4: Implement the three Route Handlers**

Do not call `currentAdmin`; these routes are deliberately public and read-only. Return JSON or XML content type as appropriate, bounded error messages, and no stack traces. Accept only GET; Next.js returns 405 for absent methods.

- [ ] **Step 5: Run API and regression tests**

Run `npm run test:public-api && npm run test:content && npm run test:maintenance`.

- [ ] **Step 6: Commit**

```bash
git add lib/public-blog-api.ts app/api/public/posts scripts/test-public-blog-api.ts package.json package-lock.json
git commit -m "feat: expose localized public blog api"
```

### Task 4: Implement Gemini translation as an atomic draft workflow

**Files:**
- Create: `lib/blog-translation.ts`
- Create: `app/api/posts/[id]/translate/route.ts`
- Create: `scripts/test-blog-translation.ts`
- Update: `lib/content-store.ts`
- Update: `package.json`

- [ ] **Step 1: Write failing translation service tests**

Inject a fake Gemini client. Cover: exact field allowlist; source structure retained; target locale opposite source; invalid JSON/schema failure; source unchanged on failure; new target always draft; existing edited target rejected without `confirmOverwrite`; retry after failure; and error text sanitized to 300 characters.

- [ ] **Step 2: Run and confirm failure**

Run `npx tsx scripts/test-blog-translation.ts`.

- [ ] **Step 3: Implement the structured Gemini request**

Send `title`, `excerpt`, `content`, `coverAlt`, `seoTitle`, and `seoDescription` only. Require JSON with those same six string fields. The system instruction must say: translate faithfully, preserve headings/paragraphs/links/markup/order, do not summarize, expand, optimize SEO, alter offers, change names, or add claims. Use `GEMINI_API_KEY || GOOGLE_API_KEY`; keep the model name in `GEMINI_TRANSLATION_MODEL` with production value `gemini-3.1-flash-lite`.

- [ ] **Step 4: Add atomic store operations**

Implement `beginPostTranslation`, `completePostTranslation`, and `failPostTranslation` with compare-and-set semantics. Completion creates or updates only the linked target, assigns an independently slugified target slug, sets `status="draft"` and `translationStatus="ready"`, and never copies `publishedAt` or `scheduledAt`.

- [ ] **Step 5: Add the authenticated POST route**

Request body is `{targetLocale:"de"|"en",confirmOverwrite:boolean}`. Return 401 without admin, 404 for source missing, 409 when overwrite confirmation is required, 422 for model/schema failure, and the linked target draft on success.

- [ ] **Step 6: Run translation tests**

Run `npm run test:translations && npm run test:localization && npm run test:revisions`.

- [ ] **Step 7: Commit**

```bash
git add lib/blog-translation.ts lib/content-store.ts app/api/posts/'[id]'/translate/route.ts scripts/test-blog-translation.ts package.json package-lock.json
git commit -m "feat: generate reviewable blog translation drafts"
```

### Task 5: Add locale and translation controls to the CMS UI

**Files:**
- Update: `components/blog-post-form.tsx`
- Update: `components/admin-blog-list.tsx`
- Update: `app/admin/blog/[id]/page.tsx`
- Update: `app/admin/blog/new/page.tsx`

- [ ] **Step 1: Add locale to the draft form**

New posts require an explicit Deutsch/English selection. Existing post locale is visible and cannot be changed after a counterpart exists. Public-preview links use `/de/blog/{slug}` or `/en/blog/{slug}`.

- [ ] **Step 2: Add translation state and counterpart navigation**

Show source/target relationship, `translating`, `ready`, and `failed` states, retry, and “Generate translation”. When the target contains content, show a confirmation dialog whose accepted action sends `confirmOverwrite:true`.

- [ ] **Step 3: Keep publishing separate**

The translation action must never call the existing save/publish path with `published`. After generation, navigate to the target draft editor and display “Übersetzung als Entwurf gespeichert”.

- [ ] **Step 4: Update the list**

Add locale and translation badges and a link to the counterpart. Filtering and scheduled publishing continue to work independently per record.

- [ ] **Step 5: Verify manually**

Run `npm run dev`, create an English draft, generate German through a fake/local test key only, verify overwrite confirmation, and confirm neither record publishes as a side effect.

- [ ] **Step 6: Commit**

```bash
git add components/blog-post-form.tsx components/admin-blog-list.tsx app/admin/blog/'[id]'/page.tsx app/admin/blog/new/page.tsx
git commit -m "feat: add bilingual blog editorial workflow"
```

### Task 6: Deploy the CMS service and verify production data

**Files:**
- Update: `.env.example`
- Update: `COOLIFY.md`
- Update: `README.md`
- Create: `artifacts/migration/qa/cms-api.md`

- [ ] **Step 1: Back up before migration**

Run `npm run backup` against the production CMS and store the archive outside Git. Record checksum, row count, and upload count.

- [ ] **Step 2: Configure production variables**

Add `GEMINI_TRANSLATION_MODEL=gemini-3.1-flash-lite`, existing Gemini key through Coolify secret storage, `NEXT_PUBLIC_SERVER_URL=https://cms.heike-ziegler.com`, and `ADMIN_EMAIL=heike.ziegler.sales@gmail.com`. Provision a new strong CMS password hash through Coolify secrets and deliver the password to Heike out of band; the business contact `heike@heike-ziegler.com` remains website copy. Do not place keys or passwords in repository files.

- [ ] **Step 3: Deploy without moving `www`**

Deploy the CMS revision, attach `cms.heike-ziegler.com`, and retain the existing `www.heike-ziegler.com` route on the old public application.

- [ ] **Step 4: Verify data and API boundary**

Confirm the existing English article is published and unchanged by comparing title/content hashes. Generate its German draft. Query all public endpoints and prove the German draft is absent.

- [ ] **Step 5: Run the full regression suite**

Run all commands listed in the roadmap final verification. Record outputs without secrets in `artifacts/migration/qa/cms-api.md`.

- [ ] **Step 6: Commit documentation and evidence**

```bash
git add .env.example COOLIFY.md README.md artifacts/migration/qa/cms-api.md
git commit -m "docs: record localized cms deployment"
```
