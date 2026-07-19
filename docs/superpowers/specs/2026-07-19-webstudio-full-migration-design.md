# Webstudio Full Website Migration Design

**Date:** 2026-07-19

**Status:** Approved for implementation planning

## Objective

Migrate the complete Make Success Your Habit website from the current Next.js frontend at `https://www.heike-ziegler.com` into the self-hosted Webstudio environment. Heike Ziegler must be able to change text, images, layouts, sections, components, and complete pages and publish changes without touching code.

The migration includes the complete German and English website, the dynamic blog, all legal pages, all existing media, redirects, SEO metadata, and the current external booking and offer links. The public production domain must remain on the existing website until the new Webstudio version has passed a joint acceptance review.

## Non-negotiable Content Rule

Source copy must be transferred without editorial changes. The migration must not shorten, rewrite, optimize, reorganize, tone-adjust, or otherwise modify existing text. Missing language versions may be translated, but the translation must preserve the source structure and meaning.

Marketing translations may be generated from the existing source and the repository's documented brand terminology, but must remain translations rather than editorial adaptations. Legal text may only be taken from the existing bilingual legal PDF documents in `public/legal`; legal text must not be freely translated by the implementation team or by an AI model.

## Current State

The current public frontend is the Next.js application in this repository. Its content surface includes:

- German and English home variants;
- Method, About Heike, Community, Instant Success Formula, ISOBL, and ISA Alliance pages;
- blog index and dynamic blog article pages;
- six legal documents and their corresponding website pages;
- static images, testimonial portraits, video, logo files, icons, and downloadable PDFs;
- Cal.com, Whop, LinkedIn, Instagram, YouTube, Vimeo, Spotify, and SoundCloud integrations or links where currently used.

The self-hosted Webstudio Builder is available at `https://webstudio.mathishoffmann.com`. The existing project `Make-Success-Your-Habit` has project ID `1f94b07b-a3c3-4dac-a589-8ec0482337f1`. It currently contains only the empty Home and 404 pages. The Builder and its project subdomains already have persistent PostgreSQL storage, HTTPS routing, and a wildcard certificate.

The current Webstudio deployment records builds locally but has no production deployment service. Its built-in local deployment contract returns `NOT_IMPLEMENTED`. The migration therefore includes a self-hosted deployment service connected through Webstudio's existing tRPC deployment interface.

## Selected Architecture

The system consists of four independently deployable services on the existing VPS.

### Webstudio Builder

`webstudio-builder` remains the visual authoring application. It owns page composition, shared components, layout, styling, static assets, page metadata, redirects, and the German and English page trees.

Heike signs in through Google OAuth using `heike.ziegler.sales@gmail.com`. She receives project-specific Admin permission, including page building and publishing. The business contact address `heike@heike-ziegler.com` remains website content and is not used as the Webstudio login identity.

The existing secret-based development login remains an emergency owner access mechanism only. It must not be Heike's normal login and must not be shared with her.

### MSYH CMS

The existing application remains the source of truth for blog posts and blog media. Its public marketing frontend is no longer the target production website after cutover. Its authenticated administration and read-only content API remain active on a dedicated CMS hostname.

The CMS is responsible for:

- blog authoring and media management;
- independent German and English article records;
- translation relationships and status;
- Gemini translation jobs;
- draft, scheduled, and published state;
- read-only delivery of published content to the public Webstudio application.

The CMS must never expose draft posts through the public read API.

### Webstudio Publisher

`webstudio-publisher` is a new internal-only service implementing Webstudio's deployment tRPC contract. It authenticates Builder requests with the existing service-token mechanism and accepts Webstudio build IDs.

For each publish request it:

1. retrieves the immutable project bundle for the requested build ID from the Builder;
2. generates the dynamic JavaScript application export;
3. builds a Docker image tagged with the Webstudio build ID;
4. starts the candidate release separately from the active release;
5. verifies container health, every locale root, every offer-page route, every legal-page route, CMS connectivity, the blog indexes, and at least one published dynamic blog route per available locale;
6. switches the selected staging or production route only after all checks pass;
7. retains the previously active image and routing information for immediate rollback;
8. returns success or a bounded, user-readable failure to Webstudio.

The service must not expose Docker control, build endpoints, deployment logs, or secrets publicly. A failed publish must leave the currently active release untouched.

### Public Webstudio Site

`msyh-webstudio-site` is the independently running exported Webstudio application. Staging is initially exposed at `https://msyh-preview.mathishoffmann.com`. The production route `https://www.heike-ziegler.com` is attached only after joint acceptance.

The old public application remains deployed and routable during the migration and after the initial cutover so that production can be rolled back by restoring its previous route.

## Page and Locale Architecture

The new website uses explicit, server-visible locale paths. Client-side language preference must not be the authoritative URL mechanism.

### German Pages

- `/de`
- `/de/methode`
- `/de/ueber-heike`
- `/de/community`
- `/de/instant-success-formula`
- `/de/isobl`
- `/de/isa-alliance`
- `/de/blog`
- `/de/blog/:slug`
- `/de/impressum`
- `/de/datenschutz`
- `/de/agb`
- `/de/nutzungsbedingungen`
- `/de/eula`
- `/de/widerruf`

### English Pages

- `/en`
- `/en/method`
- `/en/about-heike`
- `/en/community`
- `/en/instant-success-formula`
- `/en/isobl`
- `/en/isa-alliance`
- `/en/blog`
- `/en/blog/:slug`
- `/en/legal-notice`
- `/en/privacy`
- `/en/terms`
- `/en/terms-of-use`
- `/en/eula`
- `/en/refund-policy`

The root path `/` permanently redirects to `/de`. The language switcher links each page to its explicit counterpart. A blog post links to its translated counterpart only when that counterpart is published; otherwise it links to the target-language blog index.

All currently public unprefixed routes receive permanent redirects to their selected German or English equivalents. Existing blog URLs and legal URLs must continue to resolve through redirects so that external links and search-engine equity are preserved.

## Webstudio Component Model

The migration creates reusable Webstudio components for global and repeated structures, including:

- site header and desktop navigation;
- mobile navigation;
- language switcher;
- site footer and legal navigation;
- primary and secondary calls to action;
- offer and service cards;
- testimonial cards and testimonial collections;
- section headings and editorial text blocks;
- blog teaser cards and blog collections;
- legal document layout;
- shared SEO and social metadata patterns.

Components must preserve the current appearance, ordering, responsive behavior, and interaction design as closely as Webstudio permits. Technical substitutions are allowed only where Webstudio represents an existing behavior differently. Such substitutions must preserve the observable user experience and must not become a redesign.

Static website assets are copied into Webstudio and receive their current alt text and metadata. Blog-specific media remains managed by the CMS and is referenced through stable public asset URLs.

## Blog and Translation Model

The CMS stores each language version as its own editable post. A translation pair shares a stable relationship but has independent fields for:

- locale;
- title;
- slug;
- excerpt;
- article content;
- cover alt text;
- SEO title;
- SEO description;
- publication status;
- scheduled and published timestamps.

The source post records its source locale. A translation records `draft`, `translating`, `ready`, or `failed` translation state and a reference to its source post.

The translation workflow is explicitly user-triggered:

1. Heike saves the source post.
2. She chooses “Generate translation”.
3. The CMS sends only the selected post fields to the configured Google Gemini model.
4. Gemini returns a structurally equivalent translation with no summarization, expansion, tone change, or SEO rewriting.
5. The CMS validates the response and stores it as the linked target-language draft.
6. Heike reviews and publishes the target language independently.

Translation failures must not modify the source post or an existing target draft. The UI displays the failure and permits a retry. Regenerating a translation that already contains human edits requires an explicit overwrite confirmation.

The existing English blog post is preserved as the source record. Its German version is generated as a draft and must be reviewed before it appears publicly.

## Public CMS API and Webstudio Data Flow

The public site uses Webstudio Resources and bindings to consume a read-only CMS API.

Required read operations include:

- published article list filtered by locale, with pagination;
- published article by locale and slug;
- published translation counterpart metadata;
- published article slugs and update timestamps for sitemap generation.

The API returns no administrative fields, drafts, scheduled future content, translation prompts, model output diagnostics, user data, or secrets.

Blog index pages use Webstudio Collections bound to the localized article list. The dynamic `/de/blog/:slug` and `/en/blog/:slug` pages bind their URL parameter to the article-by-slug Resource. Unknown or unpublished slugs return a real 404 response.

CMS responses use bounded caching with stale-while-revalidate behavior. A short CMS outage may serve a recent published response, but stale draft or unpublished data can never become public because those states are never returned by the public endpoint.

## Publishing and Rollback

Webstudio's existing Publish interface remains the only publishing control Heike needs. The Builder already distinguishes staging and production targets; the Publisher honors that target.

Every deployed release is identified by its Webstudio build ID. Staging and production may point to different release IDs. Deployment state records the active release, previous release, start time, completion time, target, health result, and bounded failure reason.

Production publishing is enabled for Heike's Admin identity. A production release is not allowed before the initial migration acceptance gate has been explicitly passed. After cutover, later routine production publishing does not require developer involvement.

Rollback switches traffic to the previous healthy release without rebuilding it. Database migrations for the CMS must remain backward-compatible with the previous public release during the rollback window.

## SEO and Discoverability

Every localized page receives:

- language-specific title and description taken from the source or direct translation;
- canonical URL;
- reciprocal `hreflang` references where a counterpart exists;
- `x-default` pointing to the German counterpart for paired pages and to `/de` when no page-level counterpart exists;
- Open Graph and social-sharing fields;
- correct document language;
- stable heading hierarchy.

The dynamic sitemap combines static Webstudio routes and published CMS article routes. It includes last-modified values for blog posts and excludes drafts, preview URLs, the Builder, CMS administration, and the staging hostname. `robots.txt` blocks indexing on staging and allows indexing only for the accepted production site.

Existing public routes receive permanent redirects. Redirect coverage is part of acceptance testing.

## Security and Access

- Heike authenticates through Google OAuth as `heike.ziegler.sales@gmail.com`.
- Project authorization is assigned to her user identity rather than granted through an unrestricted reusable link.
- The CMS keeps its existing authenticated administration boundary.
- Builder-to-Publisher and Publisher-to-Builder traffic uses service authentication and the private Coolify network.
- Cloudflare, Google OAuth, Gemini, database, and deployment tokens remain in mode-0600 environment or Docker secret files and are never committed.
- Deployment output shown in Webstudio is sanitized and does not include shell commands, credentials, environment values, or private filesystem paths.
- The public CMS API is read-only and rate-limited.

## Failure Handling

- Failed translation: retain source and prior target draft; store a retryable failure state.
- Failed export or image build: retain active staging and production releases.
- Failed candidate health check: destroy the candidate container and retain the active route.
- Failed route switch: restore the previous route and report the deployment as failed.
- CMS temporarily unavailable: use bounded stale published responses where available; otherwise return a controlled blog error without breaking static pages.
- Missing blog slug: return 404, not a generic successful page.
- OAuth failure: deny access and preserve emergency owner access; never fall back to anonymous editing.

## Migration Sequence

1. Create a complete route, content, asset, metadata, and redirect inventory.
2. Back up the existing CMS database, media, Webstudio database, Webstudio assets, and current production deployment definition.
3. Implement the global Webstudio design system and reusable components.
4. Transfer all static German and English pages without editorial changes.
5. Extract legal copy from the supplied bilingual PDF files and build localized legal pages.
6. Extend the CMS data model, administration, public API, and Gemini draft translation workflow.
7. Build and bind the localized dynamic blog index and article pages in Webstudio.
8. Configure Google OAuth and grant Heike project-specific Admin access.
9. Implement and secure the Publisher service and versioned site releases.
10. Deploy the complete candidate to `msyh-preview.mathishoffmann.com`.
11. Perform automated and manual acceptance tests.
12. Obtain joint acceptance from the site owner and Heike.
13. Attach `www.heike-ziegler.com` to the accepted production release.
14. Retain the old release and routing definition for immediate rollback.

## Acceptance Criteria

The migration is accepted only when all of the following are true:

- every route in the approved German and English page maps exists;
- all source text is present and no unapproved editorial changes are detected;
- all legal text matches the supplied bilingual legal documents;
- visual comparisons pass at 1440 px desktop, 1024 px tablet, and 390 px mobile widths;
- navigation, language switching, external links, downloads, images, and video work;
- the current blog post appears in English and its generated German version remains a draft until reviewed;
- creating, translating, reviewing, scheduling, and publishing a test post works without code access;
- Heike can sign in, edit content and layout, create a page, publish staging, publish production after the acceptance gate, and see a useful failure state;
- a deliberately failing candidate does not replace the active site;
- rollback restores the previous healthy release;
- canonical, `hreflang`, metadata, sitemap, robots, structured article data, and redirects are correct;
- the Builder, CMS, Publisher, and public site retain data and recover correctly after container restarts;
- credentials remain untracked and are absent from logs and public responses;
- the current website remains live until the explicit cutover approval.

## Out of Scope

- redesigning the current visual identity;
- rewriting or optimizing source copy;
- AI translation of legal documents;
- replacing the blog CMS with manually duplicated Webstudio pages;
- moving publishing to Webstudio Cloud or another external hosting platform;
- deleting the previous production application immediately after cutover;
- changing Whop, Cal.com, social-media, or other external business workflows beyond preserving their existing links and embeds.
