# Admin Media Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add signature-validated uploads, Sharp image variants and focal cropping, responsive rendering, and progress-aware drag-and-drop uploads.

**Architecture:** Pure media validation and transformation modules sit behind the existing `/api/media` contract. Additive media columns preserve old rows, while a shared browser upload client powers both admin upload surfaces.

**Tech Stack:** Next.js 16, React 19, TypeScript, Sharp, Postgres/LibSQL, XHR, Node assertion scripts.

## Global Constraints

- Preserve old flat `/uploads/<filename>` URLs and Vercel Blob behavior.
- Images remain limited to 8 MB, videos to 80 MB, images to 40 MP and 12,000 px per edge.
- Do not transcode videos.
- Do not overwrite the existing uncommitted media/embed work.

---

### Task 1: Validate real media content

**Files:** Create `lib/media-validation.ts`, create `scripts/test-media-validation.ts`, modify `package.json`.

**Interfaces:** Produces `detectMediaType(bytes: Uint8Array): string | null` and `validateMediaUpload(file: File): Promise<ValidatedUpload>`.

- [ ] Write tests containing minimal JPEG, PNG, WebP, ISO-BMFF `ftyp`, and WebM EBML headers plus mismatched MIME and invalid data assertions.
- [ ] Run `tsx scripts/test-media-validation.ts`; expect module-not-found RED.
- [ ] Implement byte-signature detection: JPEG `ff d8 ff`, PNG standard 8-byte signature, RIFF/WEBP, EBML `1a45dfa3`, and ISO-BMFF with `ftyp` at byte 4. Require detected family to match the allowed declared MIME family and size limit.
- [ ] Run the focused test; expect all signature and mismatch assertions to pass.

### Task 2: Generate safe image variants

**Files:** Create `lib/image-variants.ts`, create `scripts/test-image-variants.ts`.

**Interfaces:** Produces `createImageVariants(input: Uint8Array, focalPoint?: FocalPoint): Promise<ProcessedImage>` with original metadata, 640/1280/1920 WebP buffers, and 1200×630 social buffer.

- [ ] Write a Sharp-generated in-memory image test asserting output widths, 1200×630 crop, absent EXIF, default focus, custom focus, and rejection above configured dimension/pixel limits.
- [ ] Run the test and verify RED.
- [ ] Implement `sharp(input, {limitInputPixels: 40_000_000})`, metadata checks, autorotation, `.withMetadata({orientation: undefined})` avoidance, WebP quality 82, without enlargement, and computed focal extraction for social crop.
- [ ] Run the test and verify GREEN.

### Task 3: Extend media persistence compatibly

**Files:** Modify `lib/content-store.ts`, modify `scripts/test-editor-insights.ts`.

**Interfaces:** Extend `MediaAsset` with `originalUrl`, `variants`, `width`, `height`, `focalX`, `focalY`; expose `updateMediaAsset` for alt and focus.

- [ ] Add failing normalization assertions for a new row and a legacy row with missing additive fields.
- [ ] Add Postgres/LibSQL columns through existing initialization guards: original URL, variants JSON, width, height, focal X/Y.
- [ ] Serialize variants as JSON, default focus to 0.5/0.5, and keep `url` as the public default.
- [ ] Verify legacy content tests and TypeScript.

### Task 4: Store and delete complete asset groups

**Files:** Create `lib/media-storage.ts`, modify `app/api/media/route.ts`, modify `app/api/media/[id]/route.ts`, create `scripts/test-media-storage.ts`.

**Interfaces:** Produces `storeProcessedMedia`, `deleteStoredMedia`, and stable logical paths `uploads/<asset-id>/<variant>`.

- [ ] Write filesystem tests using a temporary root for original plus variants and idempotent deletion.
- [ ] Verify RED.
- [ ] Implement local filesystem and Vercel Blob branches; return public URLs without exposing local paths.
- [ ] Integrate validation and processing into POST. Images return optimized default URL and variants; videos use validated original only.
- [ ] Delete every known URL when removing an asset.
- [ ] Run storage, validation, variants, and existing upload tests.

### Task 5: Add focus updates and responsive rendering

**Files:** Create `components/responsive-media.tsx`, modify `components/media-manager.tsx`, `components/blog-post-form.tsx`, `components/admin-blog-list.tsx`, `app/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`.

**Interfaces:** Produces `ResponsiveImage({asset|src, alt, className})`; PATCH media accepts `focalX` and `focalY` and regenerates social crop.

- [ ] Add pure tests for `mediaImageProps(asset)` returning fallback props for legacy assets and ordered `srcSet` for variants.
- [ ] Implement responsive image props and `objectPosition` from normalized focus.
- [ ] Add media focus UI that maps pointer coordinates to 0..1, saves via PATCH, and refreshes the regenerated crop.
- [ ] Replace image rendering on listed blog/admin surfaces while retaining video branches.
- [ ] Run TypeScript and browser-check desktop/mobile image rendering.

### Task 6: Add progress-aware drag-and-drop

**Files:** Create `lib/upload-client.ts`, create `components/media-upload-field.tsx`, modify `components/media-manager.tsx`, `components/blog-post-form.tsx`, create `scripts/test-upload-client.ts`.

**Interfaces:** Produces `uploadMedia(formData, {onProgress, signal}): Promise<UploadedMediaResponse>` and shared `MediaUploadField`.

- [ ] Write a fake-XHR test for progress calculation, HTTP error parsing, abort, and retry with a fresh request.
- [ ] Verify RED.
- [ ] Implement the XHR client and shared field with file dialog, drag/drop, object-URL preview, progress bar, cancel, retry, and cleanup via `URL.revokeObjectURL`.
- [ ] Integrate into both admin surfaces. Blog success applies cover; failure/abort leaves the draft unchanged.
- [ ] Run all media tests, TypeScript, production build, and browser interaction checks.
