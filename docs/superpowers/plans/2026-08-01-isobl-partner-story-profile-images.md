# ISOBL Partner Story Profile Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the eight supplied ISOBL partner portraits to optimized WebP assets and show the correct 52 × 52 pixel round portrait on every German and English partner-story interview card.

**Architecture:** A small Sharp script creates deterministic 480 × 480 WebP files in a `webp/` subfolder while preserving the PNG originals. The shared offer-page interview type accepts optional image metadata, and the ISOBL page supplies the same asset path with localized alternative text to both language variants.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Sharp 0.34, Node assert scripts

## Global Constraints

- Keep all eight PNG originals unchanged.
- Generate exactly eight WebP files at 480 × 480 pixels with quality 82.
- Render every profile image at exactly 52 × 52 CSS pixels as a circle with `object-cover`.
- Apply the image mapping to all eight German and all eight English partner-story interviews.
- Keep all existing copy, names, claims, links, short practice stories, and unrelated pages unchanged.
- Add localized alternative text: German uses `Porträt von …`; English uses `Portrait of …`.
- Keep every change local; do not upload or publish.
- Preserve unrelated local changes in `content-db/site.sqlite`, `next-env.d.ts`, `tsconfig.tsbuildinfo`, `AGENTS.md`, and existing plan files.

---

### Task 1: Generate and verify optimized WebP portraits

**Files:**
- Create: `scripts/generate-isobl-profile-images.mjs`
- Create: `scripts/test-isobl-profile-images.ts`
- Modify: `package.json`
- Create: `public/media/images/isoble-experience-pictures/webp/isa-1-angela-hancock.webp`
- Create: `public/media/images/isoble-experience-pictures/webp/isa-2-heather.webp`
- Create: `public/media/images/isoble-experience-pictures/webp/isa-3-ilse-and-tim.webp`
- Create: `public/media/images/isoble-experience-pictures/webp/isa-4-lara-eastwood.webp`
- Create: `public/media/images/isoble-experience-pictures/webp/isa-5-lissa-asselbergs.webp`
- Create: `public/media/images/isoble-experience-pictures/webp/isa-6-saskia.webp`
- Create: `public/media/images/isoble-experience-pictures/webp/isa-7-tinashe.webp`
- Create: `public/media/images/isoble-experience-pictures/webp/isa-8-michael-bockaert.webp`

**Interfaces:**
- Consumes: the eight named PNG files in `public/media/images/isoble-experience-pictures/`.
- Produces: eight stable public URLs under `/media/images/isoble-experience-pictures/webp/` for Task 2.

Use these exact source and output pairs in the generator and verification script:

| Source PNG | Output WebP |
| --- | --- |
| `ISA 1 Angela H. - Fitness Instructor.png` | `isa-1-angela-hancock.webp` |
| `ISA 2 - Heather - Business-Personal Trainer -Nutritionist.png` | `isa-2-heather.webp` |
| `ISA 3 - Ilse & Tim - Police officer & Sales Rep.png` | `isa-3-ilse-and-tim.webp` |
| `ISA 4 - Lara E. - NHS Nurse.png` | `isa-4-lara-eastwood.webp` |
| `ISA 5 - Lissa A. - Beauty Salon Owner.png` | `isa-5-lissa-asselbergs.webp` |
| `ISA 6 - SASKIA - Personal Trainer & Nutritionist.png` | `isa-6-saskia.webp` |
| `ISA 7 - Tinashe - Sales Professional with Health Background.png` | `isa-7-tinashe.webp` |
| `ISA 8 - Michael B. - Gym Owner & Personal Trainer.png` | `isa-8-michael-bockaert.webp` |

- [ ] **Step 1: Add the failing asset verification script**

Create `scripts/test-isobl-profile-images.ts` with explicit source/output pairs. For every pair, use `sharp(output).metadata()` and assert:

```ts
assert.equal(metadata.format, "webp");
assert.equal(metadata.width, 480);
assert.equal(metadata.height, 480);
assert.ok(outputStats.size < sourceStats.size);
```

Also assert that the pair list has eight unique sources and eight unique outputs. End with:

```ts
console.log("ISOBL profile image tests passed");
```

- [ ] **Step 2: Add the test command and verify the test fails**

Add this script to `package.json`:

```json
"test:isobl-images": "tsx scripts/test-isobl-profile-images.ts"
```

Run: `npm run test:isobl-images`

Expected: FAIL because the first WebP output does not exist.

- [ ] **Step 3: Add the deterministic Sharp generator**

Create `scripts/generate-isobl-profile-images.mjs` with the same eight explicit source/output pairs and this transformation:

```js
await mkdir(outputDirectory, {recursive: true});

for (const {source, output} of portraits) {
  await sharp(source)
    .resize(480, 480, {fit: "cover", position: "centre"})
    .webp({quality: 82, effort: 6})
    .toFile(output);
}

console.log(`Generated ${portraits.length} ISOBL WebP profile images`);
```

Resolve every path from `process.cwd()` and use the exact output filenames listed above. Add this command to `package.json`:

```json
"generate:isobl-images": "node scripts/generate-isobl-profile-images.mjs"
```

- [ ] **Step 4: Generate the assets and verify them**

Run: `npm run generate:isobl-images`

Expected: `Generated 8 ISOBL WebP profile images`

Run: `npm run test:isobl-images`

Expected: `ISOBL profile image tests passed`

Run: `du -h public/media/images/isoble-experience-pictures/*.png public/media/images/isoble-experience-pictures/webp/*.webp`

Expected: every WebP file is smaller than its matching PNG file.

- [ ] **Step 5: Visually inspect the generated portraits**

Create a temporary contact sheet from the eight WebP assets with Sharp outside the repository and inspect it. Confirm that all faces remain visible, the Ilse-and-Tim portrait includes both people, no image is rotated, and no important content is lost by the centered square resize.

- [ ] **Step 6: Commit the asset pipeline and generated images**

```bash
git add package.json scripts/generate-isobl-profile-images.mjs scripts/test-isobl-profile-images.ts public/media/images/isoble-experience-pictures/webp
git commit -m "feat: optimize ISOBL partner portraits"
```

### Task 2: Add localized profile metadata to the ISOBL stories

**Files:**
- Create: `lib/isobl-partner-images.ts`
- Create: `scripts/test-isobl-partner-images.ts`
- Modify: `package.json`
- Modify: `components/isobl-page-client.tsx:1-525`

**Interfaces:**
- Consumes: the eight stable WebP public URLs created by Task 1.
- Produces: `ISOBL_PARTNER_IMAGES`, keyed by the numeric ISA story ID with `{src, alt: {de, en}}` values, for the German and English interview arrays.

- [ ] **Step 1: Add the failing mapping test**

Create `scripts/test-isobl-partner-images.ts`:

```ts
import assert from "node:assert/strict";
import {ISOBL_PARTNER_IMAGES} from "../lib/isobl-partner-images";

const ids = Object.keys(ISOBL_PARTNER_IMAGES).map(Number);
assert.deepEqual(ids, [1, 2, 3, 4, 5, 6, 7, 8]);

const sources = Object.values(ISOBL_PARTNER_IMAGES).map((image) => image.src);
assert.equal(new Set(sources).size, 8);

for (const image of Object.values(ISOBL_PARTNER_IMAGES)) {
  assert.match(image.src, /^\/media\/images\/isoble-experience-pictures\/webp\/isa-[1-8]-[a-z-]+\.webp$/);
  assert.match(image.alt.de, /^Porträt von /);
  assert.match(image.alt.en, /^Portrait of /);
}

console.log("ISOBL partner image mapping tests passed");
```

Add to `package.json`:

```json
"test:isobl-mapping": "tsx scripts/test-isobl-partner-images.ts"
```

Run: `npm run test:isobl-mapping`

Expected: FAIL because `lib/isobl-partner-images.ts` does not exist.

- [ ] **Step 2: Add the eight-person localized mapping**

Create `lib/isobl-partner-images.ts` with a `as const` record containing IDs 1–8, the exact WebP URLs from Task 1, and these localized portrait subjects:

```ts
export const ISOBL_PARTNER_IMAGES = {
  1: {src: "/media/images/isoble-experience-pictures/webp/isa-1-angela-hancock.webp", alt: {de: "Porträt von Angela H.", en: "Portrait of Angela Hancock"}},
  2: {src: "/media/images/isoble-experience-pictures/webp/isa-2-heather.webp", alt: {de: "Porträt von Heather", en: "Portrait of Heather"}},
  3: {src: "/media/images/isoble-experience-pictures/webp/isa-3-ilse-and-tim.webp", alt: {de: "Porträt von Ilse und Tim", en: "Portrait of Ilse and Tim"}},
  4: {src: "/media/images/isoble-experience-pictures/webp/isa-4-lara-eastwood.webp", alt: {de: "Porträt von Lara E.", en: "Portrait of Lara Eastwood"}},
  5: {src: "/media/images/isoble-experience-pictures/webp/isa-5-lissa-asselbergs.webp", alt: {de: "Porträt von Lissa A.", en: "Portrait of Lissa Asselbergs"}},
  6: {src: "/media/images/isoble-experience-pictures/webp/isa-6-saskia.webp", alt: {de: "Porträt von Saskia", en: "Portrait of Saskia"}},
  7: {src: "/media/images/isoble-experience-pictures/webp/isa-7-tinashe.webp", alt: {de: "Porträt von Tinashe", en: "Portrait of Tinashe"}},
  8: {src: "/media/images/isoble-experience-pictures/webp/isa-8-michael-bockaert.webp", alt: {de: "Porträt von Michael B.", en: "Portrait of Michael Bockaert"}},
} as const;
```

- [ ] **Step 3: Supply profile metadata to all sixteen localized interview entries**

Import `ISOBL_PARTNER_IMAGES` in `components/isobl-page-client.tsx`. Add these two properties to every German entry, using its ISA ID:

```tsx
imageSrc: ISOBL_PARTNER_IMAGES[1].src,
imageAlt: ISOBL_PARTNER_IMAGES[1].alt.de,
```

Add the corresponding English properties to every English entry:

```tsx
imageSrc: ISOBL_PARTNER_IMAGES[1].src,
imageAlt: ISOBL_PARTNER_IMAGES[1].alt.en,
```

Repeat with IDs 2–8 in numerical order. Do not change `name`, `quote`, or `paragraphs`.

- [ ] **Step 4: Verify the mapping**

Run: `npm run test:isobl-mapping`

Expected: `ISOBL partner image mapping tests passed`

Run: `rg -n "imageSrc: ISOBL_PARTNER_IMAGES" components/isobl-page-client.tsx`

Expected: exactly 16 matches, with IDs 1–8 once in the German array and once in the English array.

- [ ] **Step 5: Commit the localized profile mapping**

```bash
git add package.json lib/isobl-partner-images.ts scripts/test-isobl-partner-images.ts components/isobl-page-client.tsx
git commit -m "feat: map ISOBL portraits to partner stories"
```

### Task 3: Render round portraits in shared partner-story cards

**Files:**
- Modify: `components/marketing-offer-page.tsx:60-66,250-288`

**Interfaces:**
- Consumes: optional `imageSrc: string` and `imageAlt: string` values on each interview.
- Produces: a lazy-loaded, 52 × 52 pixel circular profile image in the interview-card header while preserving the current header when image metadata is absent.

- [ ] **Step 1: Extend the interview type**

Add optional image properties without changing existing required fields:

```ts
interviews?: Array<{
  name: string;
  quote: string;
  paragraphs: string[];
  imageSrc?: string;
  imageAlt?: string;
}>;
```

- [ ] **Step 2: Render the portrait in the card header**

Replace the standalone interview name with a grouped identity block. Render the image only when both image properties exist:

```tsx
<div className="flex min-w-0 items-center gap-4">
  {interview.imageSrc && interview.imageAlt ? (
    <img
      alt={interview.imageAlt}
      className="h-[52px] w-[52px] shrink-0 rounded-full object-cover"
      decoding="async"
      height={480}
      loading="lazy"
      src={interview.imageSrc}
      width={480}
    />
  ) : null}
  <h3 className="min-w-0 font-serif text-2xl text-brand-primary md:text-3xl">
    {interview.name}
  </h3>
</div>
```

Keep the existing Partner Story badge in the same flexible header and retain wrapping on narrow screens.

- [ ] **Step 3: Run code and asset checks**

Run: `npm run test:isobl-images`

Expected: `ISOBL profile image tests passed`

Run: `npm run test:isobl-mapping`

Expected: `ISOBL partner image mapping tests passed`

Run: `npm run lint`

Expected: exit code 0 with no TypeScript errors.

Run: `npm run build`

Expected: exit code 0 and a successful Next.js production build.

- [ ] **Step 4: Verify both languages at large and small sizes**

Open `/en/isobl?from=angebote` and `/de/isobl?from=angebote` in the local browser. At 1440 pixels and 320 pixels wide, inspect the full partner-story interview section and confirm:

- all eight correct portraits load in each language,
- each portrait is round and visually 52 × 52 pixels,
- the portrait is not stretched or clipped incorrectly,
- Ilse and Tim both remain visible,
- name and Partner Story badge wrap without horizontal overflow,
- localized alternative text exists on all eight images,
- no existing interview text or page link changed.

Read browser console errors after both checks. Expected: no new image-loading or React rendering errors.

- [ ] **Step 5: Review the final scoped diff and commit**

Run: `git diff --check`

Run: `git status --short`

Confirm that only the agreed scripts, package file, mapping file, two components, generated WebP assets, and this plan are part of the feature. Do not stage unrelated existing changes.

```bash
git add components/marketing-offer-page.tsx components/isobl-page-client.tsx lib/isobl-partner-images.ts package.json scripts/generate-isobl-profile-images.mjs scripts/test-isobl-profile-images.ts scripts/test-isobl-partner-images.ts public/media/images/isoble-experience-pictures/webp docs/superpowers/plans/2026-08-01-isobl-partner-story-profile-images.md
git commit -m "feat: add ISOBL partner story profile images"
```

## Execution Notes

- Tasks 2 and 3 were committed together because the new interview properties and their shared
  renderer form one type-safe change and should not leave an intermediate broken build.
- The 52-pixel identity block was extracted to
  `components/partner-story-profile.tsx` and verified through
  `scripts/test-partner-story-profile.ts` before it was connected to the shared offer page.
- The missing mapping and missing profile component were each observed as failing assertions
  before their implementations were added.
- The mapping test was refactored from a guarded dynamic import to a direct import after the
  expected failure was observed, preserving full TypeScript inference in the final test suite.
