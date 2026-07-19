# CMS localization and public API QA

Date: 2026-07-19

## Verified locally

- Existing legacy post rows are backfilled as English and receive a translation group.
- German and English posts remain independent records with independent publication state.
- Gemini receives only `title`, `excerpt`, `content`, `coverAlt`, `seoTitle`, and `seoDescription`.
- Translation output is schema-checked and is always stored as a draft without publication or schedule timestamps.
- Existing translations require explicit overwrite confirmation.
- Public list/detail/sitemap responses exclude IDs, scheduling, revision, source-link, and translation-diagnostic fields.
- Drafts and future-dated posts are excluded from public responses.
- Public XML uses only `https://www.heike-ziegler.com` locations.

## Commands and results

- `npm run test:translations`: passed
- `npm run test:localization`: passed
- `npm run test:public-api`: passed
- `npm run test:revisions`: passed
- `npm run test:content`: passed
- `npm run test:maintenance`: passed
- `npm run lint`: passed
- `npm run build`: passed; all four `/api/public` routes and `/api/posts/[id]/translate` were included.

## Production gate

Production deployment and endpoint verification are still pending. The current public
`www.heike-ziegler.com` application and its routing must remain unchanged until joint acceptance.
