import assert from "node:assert/strict";
import type {BlogPost} from "../lib/content-store";
import {
  PUBLIC_CACHE_CONTROL,
  PUBLIC_SITE_ORIGIN,
  STATIC_LOCALIZED_ROUTES,
  PublicBlogApiError,
  buildPublicPostDetail,
  buildPublicPostList,
  buildPublicSitemapXml,
  parsePublicPostListQuery,
} from "../lib/public-blog-api";

const now = new Date("2026-07-19T12:00:00.000Z");
const published: BlogPost = {
  id: "post-en",
  title: "A title",
  slug: "a-title",
  excerpt: "An excerpt",
  content: "<p>Article</p>",
  coverImage: "/media/cover.webp",
  coverAlt: "Cover",
  status: "published",
  publishedAt: "2026-07-18T12:00:00.000Z",
  scheduledAt: null,
  createdAt: "2026-07-17T12:00:00.000Z",
  updatedAt: "2026-07-19T10:00:00.000Z",
  seoTitle: "SEO title",
  seoDescription: "SEO description",
  authorName: "Heike Ziegler",
  category: "Success",
  tags: "clarity,success",
  readingMinutes: 4,
  locale: "en",
  translationGroupId: "group-1",
  sourcePostId: null,
  translationStatus: "failed",
  translationError: "private provider diagnostic",
  translationUpdatedAt: "2026-07-19T11:00:00.000Z",
};

assert.deepEqual(parsePublicPostListQuery(new URLSearchParams("locale=de&page=2&pageSize=999")), {
  locale: "de",
  page: 2,
  pageSize: 50,
});
assert.equal(parsePublicPostListQuery(new URLSearchParams("locale=en&page=0&pageSize=0")).pageSize, 1);
assert.throws(
  () => parsePublicPostListQuery(new URLSearchParams("locale=fr")),
  (error) => error instanceof PublicBlogApiError && error.status === 400,
);
assert.throws(
  () => parsePublicPostListQuery(new URLSearchParams()),
  (error) => error instanceof PublicBlogApiError && error.status === 400,
);

const list = buildPublicPostList([published], {page: 1, pageSize: 12, total: 13});
assert.equal(list.nextPage, 2);
assert.equal(list.items.length, 1);
assert.equal(list.total, 13);
const listJson = JSON.stringify(list);
for (const privateField of [
  "id",
  "status",
  "scheduledAt",
  "createdAt",
  "translationError",
  "translationStatus",
  "translationGroupId",
  "sourcePostId",
]) {
  assert.equal(listJson.includes(`\"${privateField}\"`), false, `${privateField} leaked`);
}

const unpublishedCounterpart = {
  ...published,
  id: "post-de",
  locale: "de" as const,
  slug: "ein-titel",
  status: "draft" as const,
  publishedAt: null,
};
assert.deepEqual(buildPublicPostDetail(published, unpublishedCounterpart, now)?.counterpart, null);
assert.equal(buildPublicPostDetail(undefined, undefined, now), null);
assert.equal(buildPublicPostDetail({...published, publishedAt: "2026-07-20T12:00:00.000Z"}, undefined, now), null);

const publishedCounterpart = {
  ...unpublishedCounterpart,
  status: "published" as const,
  publishedAt: "2026-07-18T12:00:00.000Z",
};
assert.deepEqual(buildPublicPostDetail(published, publishedCounterpart, now)?.counterpart, {
  locale: "de",
  slug: "ein-titel",
});

const sitemap = buildPublicSitemapXml([
  {locale: "en", slug: "a-title", updatedAt: "2026-07-19T10:00:00.000Z"},
  {locale: "de", slug: "ein-titel", updatedAt: "2026-07-19T11:00:00.000Z"},
]);
assert.equal(PUBLIC_SITE_ORIGIN, "https://www.heike-ziegler.com");
assert.match(sitemap, /https:\/\/www\.heike-ziegler\.com\/en\/blog\/a-title/);
assert.match(sitemap, /https:\/\/www\.heike-ziegler\.com\/de\/blog\/ein-titel/);
assert.equal(sitemap.includes("cms.heike-ziegler.com"), false);
for (const route of STATIC_LOCALIZED_ROUTES) {
  assert.equal(sitemap.includes(`${PUBLIC_SITE_ORIGIN}${route}`), true, `missing ${route}`);
}
assert.equal(PUBLIC_CACHE_CONTROL, "public, s-maxage=60, stale-while-revalidate=300");

console.log("public blog api contracts: ok");
