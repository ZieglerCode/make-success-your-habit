import assert from "node:assert/strict";
import {
  localizedSlugKey,
  oppositeBlogLocale,
  parseBlogLocale,
  parseTranslationStatus,
  toPublicPost,
} from "../lib/blog-localization";

assert.equal(parseBlogLocale("de"), "de");
assert.equal(parseBlogLocale("en"), "en");
assert.equal(parseBlogLocale("DE"), null);
assert.equal(parseBlogLocale("fr"), null);
assert.equal(parseBlogLocale(undefined), null);
assert.equal(oppositeBlogLocale("de"), "en");
assert.equal(oppositeBlogLocale("en"), "de");
assert.equal(localizedSlugKey("de", " Erfolg-Beginnt "), "de:erfolg-beginnt");

for (const state of ["none", "translating", "ready", "failed"] as const) {
  assert.equal(parseTranslationStatus(state), state);
}
assert.equal(parseTranslationStatus("published"), null);

const publicPost = toPublicPost({
  authorName: "Heike Ziegler",
  category: "Identity",
  content: "Content",
  coverAlt: "Portrait",
  coverImage: "/image.webp",
  createdAt: "private-created",
  excerpt: "Excerpt",
  id: "private-id",
  locale: "en",
  publishedAt: "2026-07-19T10:00:00.000Z",
  readingMinutes: 2,
  scheduledAt: null,
  seoDescription: "SEO description",
  seoTitle: "SEO title",
  slug: "success",
  sourcePostId: "private-source",
  status: "published",
  tags: "Success, Identity",
  title: "Success",
  translationError: "private-error",
  translationGroupId: "private-group",
  translationStatus: "ready",
  translationUpdatedAt: "private-translation-date",
  updatedAt: "2026-07-19T11:00:00.000Z",
});

assert.deepEqual(publicPost, {
  authorName: "Heike Ziegler",
  category: "Identity",
  content: "Content",
  coverAlt: "Portrait",
  coverImage: "/image.webp",
  excerpt: "Excerpt",
  locale: "en",
  publishedAt: "2026-07-19T10:00:00.000Z",
  readingMinutes: 2,
  seoDescription: "SEO description",
  seoTitle: "SEO title",
  slug: "success",
  tags: "Success, Identity",
  title: "Success",
  updatedAt: "2026-07-19T11:00:00.000Z",
});
assert.equal("id" in publicPost, false);
assert.equal("translationError" in publicPost, false);
assert.equal("scheduledAt" in publicPost, false);

console.log("blog localization contracts: ok");
