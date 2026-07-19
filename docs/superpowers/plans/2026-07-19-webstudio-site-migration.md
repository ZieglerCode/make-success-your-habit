# Webstudio Bilingual Site Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the complete current website in project `1f94b07b-a3c3-4dac-a589-8ec0482337f1` as an editable bilingual Webstudio site with dynamic CMS-backed blog pages and no editorial copy changes.

**Architecture:** Machine-readable inventories make the existing rendered site the copy/visual baseline. Webstudio CLI/MCP performs structured page, asset, resource, token, component, redirect, and metadata mutations against one linked project. Localized static page trees use reusable Webstudio structures; dynamic blog pages bind CMS Resources to path parameters; generated preview screenshots and copy hashes prove parity.

**Tech Stack:** Webstudio Builder/CLI at the approved pinned deployment, Webstudio MCP project editing, Playwright through the repository tooling, PDF extraction/rendering, JSON inventories, screenshot diffs.

## Global Constraints

- Invoke `pdf:pdf` before extracting legal documents and follow its render-and-verify workflow.
- Invoke `browser:control-in-app-browser` for Builder operations that require the signed-in browser.
- Use Webstudio CLI/MCP schemas discovered from the installed server; never guess component IDs, prop names, resource expressions, or mutation inputs.
- Preserve source order, punctuation, casing, whitespace semantics, links, embeds, and claims. Translation is the only permitted copy transformation.
- Every Webstudio mutation must report `meta.session.committed=true`; inspect ambiguous results before retrying.
- Use one linked `.webstudio` session sequentially. Do not run simultaneous mutations against this project.
- Do not publish to or route `www.heike-ziegler.com` in this workstream.

---

### Task 1: Create a complete source inventory and immutable baselines

**Files:**
- Create: `scripts/migration/crawl-current-site.mjs`
- Create: `scripts/migration/extract-source-copy.mjs`
- Create: `scripts/migration/capture-baselines.mjs`
- Create: `scripts/migration/compare-copy.mjs`
- Create: `artifacts/migration/inventory/routes.json`
- Create: `artifacts/migration/inventory/copy.json`
- Create: `artifacts/migration/inventory/links.json`
- Create: `artifacts/migration/inventory/assets.json`
- Create: `artifacts/migration/inventory/metadata.json`

- [ ] **Step 1: Write crawler fixture tests before implementation**

Create inline HTML fixtures that assert heading/paragraph/list/button text order, meaningful image alt text, link targets, canonical/hreflang/OG fields, video/embed URLs, and whitespace normalization without punctuation changes.

- [ ] **Step 2: Implement the crawler**

Crawl the current live routes and repository-rendered routes. Record status, final URL, document language, ordered semantic text nodes, headings, links, images, video/audio/iframe sources, downloads, and metadata. Use explicit route seeds from the approved page map; do not depend on the broken old sitemap.

- [ ] **Step 3: Capture the three viewport baselines**

Store full-page PNGs for each current route at 1440×900, 1024×768, and 390×844 under `artifacts/migration/baseline/screenshots/{viewport}/`. Record SHA-256 and capture timestamp.

- [ ] **Step 4: Inventory repository assets**

Hash all files under `public/media` and `public/legal`; record media type, dimensions/duration where applicable, byte size, source usage, and alt text. Flag unused files but do not delete them.

- [ ] **Step 5: Run and review**

Confirm every current route and all 51 known public assets are accounted for; reconcile differences caused by redirects or conditional language rendering.

- [ ] **Step 6: Commit scripts and non-binary manifests**

```bash
git add scripts/migration artifacts/migration/inventory artifacts/migration/baseline/manifest.json
git commit -m "test: capture website migration baseline"
```

Do not commit the bulk screenshot set if repository policy excludes generated artifacts; retain it in the backed-up migration workspace.

### Task 2: Extract and verify the six bilingual legal page sources

**Files:**
- Create: `artifacts/migration/inventory/legal/de.json`
- Create: `artifacts/migration/inventory/legal/en.json`
- Create: `artifacts/migration/inventory/legal-verification.md`

- [ ] **Step 1: Render every legal PDF**

Render all pages from the five files under `public/legal` to images, inspect page order/columns, and extract text with layout preservation. The files collectively supply AGB/T&C, Datenschutz/Privacy, EULA, Terms of Use/Nutzungsbedingungen, Refund/Widerruf, and the legal-notice/imprint material.

- [ ] **Step 2: Build language-specific structured records**

For each approved legal URL, store ordered headings, paragraphs, lists, dates/versions, contact details, and source PDF plus page numbers. Do not translate or normalize legal wording.

- [ ] **Step 3: Verify against PDF renderings**

Perform line-by-line comparison and manual visual spot checks for umlauts, section numbers, bullets, dates, email/domain strings, and cross-references. Record any PDF extraction ambiguity and resolve it from the rendered page, never from an AI paraphrase.

- [ ] **Step 4: Commit the verified legal text inventory**

```bash
git add artifacts/migration/inventory/legal artifacts/migration/inventory/legal-verification.md
git commit -m "docs: extract verified bilingual legal copy"
```

### Task 3: Prepare the authenticated Webstudio CLI project session

**Files:**
- Create locally, untracked: `.env.webstudio-project.local`
- Create locally, untracked: `.webstudio/config.json`
- Update: `.gitignore`
- Create: `artifacts/migration/qa/webstudio-session.md`

- [ ] **Step 1: Back up the Webstudio database and assets**

On the VPS, create a PostgreSQL dump and assets archive for project `1f94b07b-a3c3-4dac-a589-8ec0482337f1`, checksum both, and store outside Git.

- [ ] **Step 2: Create a temporary project-specific administrator API/share token**

Use the signed-in owner session in Builder. Store the link/token only in `.env.webstudio-project.local` with mode 0600. Do not use this token for Heike's human login.

- [ ] **Step 3: Link and inspect the exact project**

Run Webstudio CLI `init --link` from a dedicated `webstudio-project/` working directory, then `permissions --json`, `inspect`, `status`, `list-pages`, `list-breakpoints`, and `get-project-settings`. Assert project ID, administrator/publish capability, and only the expected initial Home/404 pages.

- [ ] **Step 4: Discover mutation schemas**

Run `meta.index`, `meta.get_more_tools` for page/folder/redirect/token/style/resource/asset/component/fragment/publish operations, and read `webstudio://project/expressions`. Save only redacted schemas/operation names in `artifacts/migration/qa/webstudio-session.md`.

- [ ] **Step 5: Confirm ignore rules and commit**

Run `git check-ignore .env.webstudio-project.local webstudio-project/.webstudio/config.json` and commit only `.gitignore` plus sanitized evidence.

### Task 4: Establish the exact design system and reusable global structures

**Files:**
- Create: `artifacts/migration/webstudio/design-tokens.json`
- Create: `artifacts/migration/webstudio/component-map.json`
- Create: `artifacts/migration/webstudio/mcp-design-system.json`

- [ ] **Step 1: Derive tokens from the existing implementation**

Inventory exact font families/weights, colors, spacing, radii, borders, shadows, maximum widths, and three responsive ranges from the current CSS/components and computed live styles. No aesthetic substitutions are allowed without recording a Webstudio technical limitation.

- [ ] **Step 2: Create breakpoints and tokens through MCP dry runs**

Configure desktop/base, tablet max-width 1023, and mobile max-width 767 as required by the existing behavior. Dry-run each batch, inspect the transaction, then commit it and verify `meta.session.committed`.

- [ ] **Step 3: Build reusable structures**

Create the header, mobile navigation, language switcher, footer/legal navigation, CTA patterns, offer cards, testimonial cards/collections, section headings, editorial text, blog cards/collection, and legal layout using discovered component/template/convert operations. Use Webstudio-native editable text and style data, not opaque embedded HTML.

- [ ] **Step 4: Verify editability in Builder**

Open each reusable structure in the visual Builder and prove text, image, layout, and responsive styles can be changed without code. Restore the baseline values after the test.

- [ ] **Step 5: Commit manifests**

```bash
git add artifacts/migration/webstudio/design-tokens.json artifacts/migration/webstudio/component-map.json artifacts/migration/webstudio/mcp-design-system.json
git commit -m "feat: establish webstudio site design system"
```

### Task 5: Upload and map static assets

**Files:**
- Create: `artifacts/migration/webstudio/asset-map.json`
- Create: `artifacts/migration/webstudio/mcp-assets.json`

- [ ] **Step 1: Upload assets with exact metadata**

Use the discovered `assets.upload` schema for every static site image, logo, icon, video, and downloadable legal PDF. Preserve original files; select existing WebP variants where the current site uses them. Blog media is not copied and remains at stable CMS URLs.

- [ ] **Step 2: Map source hashes to Webstudio IDs**

Record source path, SHA-256, Webstudio asset ID, width/height, MIME type, alt text, and all consuming pages. Detect duplicate uploads by hash.

- [ ] **Step 3: Verify rendered assets**

Check no asset 404s, video playback, poster/cover behavior, aspect ratios, focal points, and accessible alt text. Confirm no local filesystem URL or Builder-private URL appears in public output.

- [ ] **Step 4: Commit maps**

```bash
git add artifacts/migration/webstudio/asset-map.json artifacts/migration/webstudio/mcp-assets.json
git commit -m "feat: migrate webstudio static assets"
```

### Task 6: Build all German static pages without editorial changes

**Files:**
- Create: `artifacts/migration/webstudio/mcp-pages-de.json`
- Update: `artifacts/migration/webstudio/component-map.json`

- [ ] **Step 1: Create the exact German page tree**

Create `/de`, `/de/methode`, `/de/ueber-heike`, `/de/community`, `/de/instant-success-formula`, `/de/isobl`, `/de/isa-alliance`, `/de/impressum`, `/de/datenschutz`, `/de/agb`, `/de/nutzungsbedingungen`, `/de/eula`, and `/de/widerruf`.

- [ ] **Step 2: Transfer existing German copy in source order**

Populate each page from `copy.json` and the verified legal inventory. Where the current app only has an English route/content variant, translate directly into German with the same section structure, claims, names, links, and emphasis. Record each translation pair and source hash; do not optimize wording.

- [ ] **Step 3: Recreate interactions and external links**

Preserve Cal.com, Whop, LinkedIn, Instagram, YouTube, Vimeo, Spotify, SoundCloud, mail, download, video, and anchor behavior exactly where used.

- [ ] **Step 4: Add German metadata**

Use existing metadata or faithful translation. Set canonical, document language, Open Graph values, and `hreflang` links to existing English counterparts.

- [ ] **Step 5: Run copy comparison**

The comparison script must report zero missing source nodes and zero mutations for source-language copy; translated-only nodes are checked against the translation ledger.

- [ ] **Step 6: Commit mutation manifest and evidence**

```bash
git add artifacts/migration/webstudio/mcp-pages-de.json artifacts/migration/webstudio/component-map.json artifacts/migration/qa/copy-de.md
git commit -m "feat: migrate german webstudio pages"
```

### Task 7: Build all English static pages without editorial changes

**Files:**
- Create: `artifacts/migration/webstudio/mcp-pages-en.json`
- Create: `artifacts/migration/inventory/translation-ledger.json`

- [ ] **Step 1: Create the exact English page tree**

Create `/en`, `/en/method`, `/en/about-heike`, `/en/community`, `/en/instant-success-formula`, `/en/isobl`, `/en/isa-alliance`, `/en/legal-notice`, `/en/privacy`, `/en/terms`, `/en/terms-of-use`, `/en/eula`, and `/en/refund-policy`.

- [ ] **Step 2: Transfer or translate copy**

Use English source text verbatim where present. Translate only missing marketing counterparts from German and preserve the page/section structure. Legal English comes only from the verified PDF inventory.

- [ ] **Step 3: Pair language navigation**

Map every German static page to its exact English counterpart and vice versa. Language-switch links are normal server-visible URLs, not local-storage state.

- [ ] **Step 4: Add English metadata and reciprocal hreflang**

Set canonical, `en`, reciprocal `de`, and `x-default`; `x-default` points to the paired German page.

- [ ] **Step 5: Run copy comparison and commit**

```bash
git add artifacts/migration/webstudio/mcp-pages-en.json artifacts/migration/inventory/translation-ledger.json artifacts/migration/qa/copy-en.md
git commit -m "feat: migrate english webstudio pages"
```

### Task 8: Bind localized dynamic blog pages to the CMS

**Files:**
- Create: `artifacts/migration/webstudio/resource-map.json`
- Create: `artifacts/migration/webstudio/mcp-blog.json`
- Create: `artifacts/migration/qa/blog-bindings.md`

- [ ] **Step 1: Create list Resources**

Create GET Resources for `https://cms.heike-ziegler.com/api/public/posts?locale=de&page=1&pageSize=12` and `locale=en`. Bind `/de/blog` and `/en/blog` Collections to `items`, with title, excerpt, cover, alt, category, date, and locale-aware detail link.

- [ ] **Step 2: Create dynamic article Resources**

Create `/de/blog/:slug` and `/en/blog/:slug`. Bind the route `slug` variable into `https://cms.heike-ziegler.com/api/public/posts/{locale}/{slug}` using the exact expression syntax returned by `webstudio://project/expressions`. Bind article content, cover, metadata, dates, author, structured Article data, and counterpart link.

- [ ] **Step 3: Enforce missing/unpublished behavior**

Configure a real 404 response/page when the Resource returns 404. Do not render an empty 200 article. If counterpart metadata is null, link the switcher to the other-language blog index.

- [ ] **Step 4: Verify CMS outage behavior**

Confirm static pages still render. Confirm the bounded stale cache serves a recently published response where available and otherwise shows a controlled blog error without draft leakage.

- [ ] **Step 5: Commit resource manifests and evidence**

```bash
git add artifacts/migration/webstudio/resource-map.json artifacts/migration/webstudio/mcp-blog.json artifacts/migration/qa/blog-bindings.md
git commit -m "feat: bind webstudio localized blog"
```

### Task 9: Configure redirects, root, sitemap, robots, and 404

**Files:**
- Create: `artifacts/migration/inventory/redirects.json`
- Create: `artifacts/migration/webstudio/mcp-seo-routing.json`
- Create: `artifacts/migration/qa/seo-routing.md`

- [ ] **Step 1: Configure root and legacy redirects**

Set `/` → `/de` with 301. Add every current unprefixed marketing, blog, and legal URL to its approved localized equivalent. Preserve query strings where Webstudio supports them and document exceptions.

- [ ] **Step 2: Configure real 404 behavior**

Style the existing 404 page consistently and test an unknown static route plus unknown DE/EN blog slugs return HTTP 404.

- [ ] **Step 3: Expose the combined sitemap**

Redirect `/sitemap.xml` to `https://cms.heike-ziegler.com/api/public/sitemap.xml` with 302 so the XML remains dynamic; verify every `<loc>` is on `https://www.heike-ziegler.com`, includes all static localized routes and published posts, and excludes preview/drafts/admin.

- [ ] **Step 4: Configure robots by environment**

Preview responds `Disallow: /` and noindex headers. Production robots allows crawling and declares the production sitemap URL; production settings are activated only in the cutover plan.

- [ ] **Step 5: Run SEO/routing checks and commit**

```bash
git add artifacts/migration/inventory/redirects.json artifacts/migration/webstudio/mcp-seo-routing.json artifacts/migration/qa/seo-routing.md
git commit -m "feat: configure webstudio seo and redirects"
```

### Task 10: Publish preview and perform visual/copy parity iteration

**Files:**
- Create: `scripts/migration/compare-preview.mjs`
- Create: `artifacts/migration/qa/visual-summary.md`
- Create: `artifacts/migration/qa/content-parity.json`

- [ ] **Step 1: Publish through the real Publisher**

Publish only to `msyh-preview.mathishoffmann.com`. Record Webstudio build ID and release image ID.

- [ ] **Step 2: Capture every preview route at all viewports**

Generate current PNGs and pixel/region diffs against the source baseline at 1440×900, 1024×768, and 390×844. Use OCR/text extraction where available.

- [ ] **Step 3: Iterate focused differences**

Correct Webstudio styles/layout/assets/interactions through structured mutations. Do not resolve a mismatch by changing source copy. Record unavoidable technical deviations for joint acceptance.

- [ ] **Step 4: Run final machine checks**

Assert route status, text-node parity, legal text parity, no broken internal/external links, no asset failures, metadata/canonical/hreflang, article JSON-LD, sitemap, robots, accessibility basics, and performance budgets.

- [ ] **Step 5: Commit scripts and sanitized QA summary**

```bash
git add scripts/migration/compare-preview.mjs artifacts/migration/qa/visual-summary.md artifacts/migration/qa/content-parity.json
git commit -m "test: verify webstudio migration parity"
```

