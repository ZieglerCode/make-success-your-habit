# Admin Blog Cover Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Coolify-hosted uploads immediately retrievable and automatically use each successful admin-blog upload as the current draft cover with a working preview.

**Architecture:** Keep the existing upload API and `/uploads/<filename>` database URLs. Add a Node.js route backed by the persistent `public/uploads` volume, isolate path and response handling in a testable storage helper, and isolate successful-upload-to-cover state mapping in a pure helper used by the editor.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.8, Node.js filesystem APIs, `tsx` assertion scripts, Tailwind CSS.

## Global Constraints

- Preserve existing `/uploads/<filename>` URLs and Vercel Blob support.
- Preserve the current allowed formats and limits: JPG, PNG and WebP up to 8 MB; MP4, MOV and WebM up to 80 MB.
- Do not auto-save the blog post after upload.
- Do not insert the uploaded cover into article content automatically.
- Preserve all pre-existing uncommitted changes in `components/blog-post-form.tsx`, `components/blog-content-renderer.tsx`, `Dockerfile`, and `COOLIFY.md`.

---

### Task 1: Serve runtime uploads from the Coolify volume

**Files:**
- Create: `lib/local-upload-response.ts`
- Create: `app/uploads/[filename]/route.ts`
- Create: `scripts/test-local-upload-response.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `localUploadResponse(filename: string, uploadDirectory?: string): Promise<Response>`.
- Produces: `GET(_request: Request, context: {params: Promise<{filename: string}>}): Promise<Response>`.
- Consumes: Files written by the existing `POST /api/media` handler under `public/uploads`.

- [ ] **Step 1: Write the failing storage-response test**

Create `scripts/test-local-upload-response.ts` with assertions that:

```ts
import assert from "node:assert/strict";
import {mkdtemp, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {localUploadResponse} from "../lib/local-upload-response";

const directory = await mkdtemp(path.join(os.tmpdir(), "msyh-upload-test-"));
await writeFile(path.join(directory, "cover-123.webp"), new Uint8Array([82, 73, 70, 70]));

const found = await localUploadResponse("cover-123.webp", directory);
assert.equal(found.status, 200);
assert.equal(found.headers.get("content-type"), "image/webp");
assert.equal(found.headers.get("cache-control"), "public, max-age=31536000, immutable");
assert.deepEqual(Array.from(new Uint8Array(await found.arrayBuffer())), [82, 73, 70, 70]);

assert.equal((await localUploadResponse("missing.webp", directory)).status, 404);
assert.equal((await localUploadResponse("../secret.webp", directory)).status, 404);
assert.equal((await localUploadResponse("folder/secret.webp", directory)).status, 404);

console.log("local upload response tests passed");
```

Add `"test:uploads": "tsx scripts/test-local-upload-response.ts && tsx scripts/test-blog-upload.ts"` to `package.json`; temporarily run the first script directly until Task 2 creates the second script.

- [ ] **Step 2: Run the test and verify RED**

Run: `npx tsx scripts/test-local-upload-response.ts`

Expected: FAIL because `lib/local-upload-response.ts` does not exist.

- [ ] **Step 3: Implement the minimal safe response helper**

Create `lib/local-upload-response.ts` with:

```ts
import {readFile} from "node:fs/promises";
import path from "node:path";

const CONTENT_TYPES: Record<string, string> = {
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".mov": "video/quicktime",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".webm": "video/webm",
  ".webp": "image/webp",
};

export async function localUploadResponse(
  filename: string,
  uploadDirectory = path.join(process.cwd(), "public", "uploads"),
) {
  if (!isSafeFilename(filename)) return new Response("Not found.", {status: 404});

  try {
    const file = await readFile(path.join(uploadDirectory, filename));
    return new Response(new Uint8Array(file), {
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
        "content-type": CONTENT_TYPES[path.extname(filename).toLowerCase()] || "application/octet-stream",
      },
    });
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return new Response("Not found.", {status: 404});
    return new Response("Upload konnte nicht geladen werden.", {status: 500});
  }
}

function isSafeFilename(filename: string) {
  return Boolean(filename) && filename === path.basename(filename) && !filename.includes("\\") && !filename.includes("\0");
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
```

- [ ] **Step 4: Add the App Router endpoint**

Create `app/uploads/[filename]/route.ts`:

```ts
import {localUploadResponse} from "@/lib/local-upload-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {params: Promise<{filename: string}>};

export async function GET(_request: Request, context: RouteContext) {
  const {filename} = await context.params;
  return localUploadResponse(filename);
}
```

- [ ] **Step 5: Run the test and verify GREEN**

Run: `npx tsx scripts/test-local-upload-response.ts`

Expected: PASS and print `local upload response tests passed`.

### Task 2: Automatically map a successful upload to the draft cover

**Files:**
- Create: `lib/blog-upload.ts`
- Create: `scripts/test-blog-upload.ts`
- Modify: `components/blog-post-form.tsx`

**Interfaces:**
- Produces: `applyUploadedCover<T extends CoverDraft>(draft: T, upload: UploadedMedia): T`.
- Consumes: the existing upload API response normalized as `{url, mimeType, alt}`.

- [ ] **Step 1: Write the failing cover-mapping test**

Create `scripts/test-blog-upload.ts`:

```ts
import assert from "node:assert/strict";
import {applyUploadedCover} from "../lib/blog-upload";

const current = {coverAlt: "Bisheriges Cover", coverImage: "/media/images/heike-ziegler.webp", title: "Test"};
const uploaded = {alt: "Neues Portrait", mimeType: "image/webp", url: "/uploads/neues-portrait-123.webp"};
const next = applyUploadedCover(current, uploaded);

assert.deepEqual(next, {...current, coverAlt: "Neues Portrait", coverImage: uploaded.url});
assert.notEqual(next, current);
assert.equal(applyUploadedCover(current, {...uploaded, alt: ""}).coverAlt, current.coverAlt);
console.log("blog upload mapping tests passed");
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npx tsx scripts/test-blog-upload.ts`

Expected: FAIL because `lib/blog-upload.ts` does not exist.

- [ ] **Step 3: Implement the pure mapping helper**

Create `lib/blog-upload.ts`:

```ts
export type UploadedMedia = {alt: string; mimeType: string; url: string};
type CoverDraft = {coverAlt: string; coverImage: string};

export function applyUploadedCover<T extends CoverDraft>(draft: T, upload: UploadedMedia): T {
  return {
    ...draft,
    coverAlt: upload.alt.trim() || draft.coverAlt,
    coverImage: upload.url,
  };
}
```

- [ ] **Step 4: Use the helper after a successful upload**

In `components/blog-post-form.tsx`:

```ts
import {applyUploadedCover, type UploadedMedia} from "@/lib/blog-upload";
```

Type `lastUpload` as `UploadedMedia | null`. After `setLastUpload(uploaded)`, add `setDraft((current) => applyUploadedCover(current, uploaded));`, clear the general save message, and change the success copy to:

```ts
setMessage(null);
setUploadMessage("Upload abgeschlossen und als Cover gesetzt. Beitrag noch speichern.");
```

Keep `insertUploadedMedia` explicit. Replace the redundant two-column action row with one full-width `Einfügen` action and a compact confirmation label `Als Cover gesetzt`.

- [ ] **Step 5: Run mapping and upload-response tests**

Run: `npm run test:uploads`

Expected: both scripts PASS.

### Task 3: Show useful preview errors instead of broken media

**Files:**
- Modify: `components/blog-post-form.tsx`

**Interfaces:**
- Produces: reusable `MediaPreview` props `{asset: UploadedMedia; className?: string}`.
- Consumes: upload preview and current cover preview URLs.

- [ ] **Step 1: Add preview load-state behavior**

Extend `MediaPreview` with local `hasError` state, reset it whenever `asset.url` changes, and attach `onError={() => setHasError(true)}` to both `<img>` and `<video>`. When `hasError` is true, render:

```tsx
<div className="flex aspect-video items-center justify-center rounded-2xl border border-[#7f1d1d]/25 bg-[#7f1d1d]/10 px-4 text-center text-sm text-[#7f1d1d]" role="alert">
  Die Vorschau konnte nicht geladen werden. Bitte Upload oder Speicher-Konfiguration prüfen.
</div>
```

- [ ] **Step 2: Reuse the guarded preview in the Cover card**

Replace the direct cover `<img>`/`<video>` branch with `MediaPreview`, passing `draft.coverImage`, `draft.coverAlt`, and a MIME inferred from `isCoverVideo`. Preserve the existing 16:10 cover-card geometry via a `className` prop.

- [ ] **Step 3: Run static verification**

Run: `npm run lint`

Expected: TypeScript exits with code 0.

### Task 4: Verify production behavior and document the deployment boundary

**Files:**
- Modify only if needed: `COOLIFY.md`

**Interfaces:**
- Consumes: Next.js production build, persistent mount `uploads:/app/public/uploads`, admin editor workflow.
- Produces: verified upload retrieval and editor behavior.

- [ ] **Step 1: Run all focused tests**

Run: `npm run test:content && npm run test:uploads`

Expected: all assertion scripts PASS.

- [ ] **Step 2: Build the production application**

Run: `npm run build`

Expected: Next.js production build exits with code 0 and includes `/uploads/[filename]`.

- [ ] **Step 3: Prove post-start file delivery**

Start the built server, create a temporary uniquely named WebP fixture in `public/uploads` after the server is already listening, request `/uploads/<fixture>`, and verify status `200`, `content-type: image/webp`, and byte equality. Remove only that temporary fixture afterward.

- [ ] **Step 4: Run browser interaction QA**

The flow under test is: `/admin/blog/<id>` -> choose an image -> new upload and cover previews render -> unsaved state appears -> save -> reload -> the same cover remains.

Verify page identity, meaningful DOM, no framework overlay, relevant console errors/warnings, screenshot evidence, upload interaction, cover URL change, save, and reload persistence. Also test one deliberately invalid preview URL and verify the visible error state. Use desktop and one mobile viewport where practical.

- [ ] **Step 5: Review the Coolify note**

Confirm `COOLIFY.md` still documents the required mount exactly as `uploads:/app/public/uploads`. Amend it only if verification reveals an additional required deployment setting.

- [ ] **Step 6: Review the final diff**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors; pre-existing user changes remain present and identifiable.
