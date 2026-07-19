import assert from "node:assert/strict";
import {mkdtemp} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {createClient} from "@libsql/client";

const directory = await mkdtemp(path.join(os.tmpdir(), "content-localization-"));
process.env.CONTENT_DB_DIR = directory;
const databaseDirectory = path.join(directory, "content-db");
await import("node:fs/promises").then(({mkdir}) => mkdir(databaseDirectory, {recursive: true}));
const database = createClient({url: `file:${path.join(databaseDirectory, "site.sqlite")}`});
const legacyId = "legacy-english-post";

await database.execute(`CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  coverImage TEXT NOT NULL,
  status TEXT NOT NULL,
  publishedAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  seoTitle TEXT NOT NULL,
  seoDescription TEXT NOT NULL
)`);
await database.execute({
  sql: `INSERT INTO posts
    (id,title,slug,excerpt,content,coverImage,status,publishedAt,createdAt,updatedAt,seoTitle,seoDescription)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
  args: [
    legacyId,
    "Existing English",
    "existing-english",
    "Excerpt",
    "Content",
    "/cover.webp",
    "published",
    "2026-01-01T00:00:00.000Z",
    "2026-01-01T00:00:00.000Z",
    "2026-01-01T00:00:00.000Z",
    "Existing English",
    "Excerpt",
  ],
});
await database.close();

const {
  createPost,
  beginPostTranslation,
  completePostTranslation,
  failPostTranslation,
  getPostById,
  getPublishedPostByLocaleSlug,
  getTranslationCounterpart,
  listPosts,
  listPublishedPostSitemapEntries,
} = await import("../lib/content-store.ts");
const {BlogTranslationError} = await import("../lib/blog-translation.ts");

const legacy = await getPostById(legacyId);
assert.equal(legacy?.locale, "en");
assert.equal(legacy?.translationStatus, "none");
assert.ok(legacy?.translationGroupId);
assert.equal(legacy?.sourcePostId, null);

const pairId = "translation-pair-1";
const german = await createPost({
  locale: "de",
  title: "Deutscher Beitrag",
  slug: "deutscher-beitrag",
  status: "published",
  publishedAt: "2026-02-01T00:00:00.000Z",
  translationGroupId: pairId,
});
const englishDraft = await createPost({
  locale: "en",
  sourcePostId: german.id,
  title: "English draft",
  slug: "english-draft",
  status: "draft",
  translationGroupId: pairId,
  translationStatus: "ready",
});
await createPost({
  locale: "de",
  title: "Future publication",
  slug: "future-publication",
  status: "published",
  publishedAt: "2099-01-01T00:00:00.000Z",
});

const germanPosts = await listPosts({locale: "de", publishedOnly: true});
assert.deepEqual(germanPosts.map(({slug}) => slug), ["deutscher-beitrag"]);
assert.equal((await getPublishedPostByLocaleSlug("de", german.slug))?.id, german.id);
assert.equal(await getPublishedPostByLocaleSlug("en", englishDraft.slug), undefined);
assert.equal((await getTranslationCounterpart(german.id))?.id, englishDraft.id);

const sitemap = await listPublishedPostSitemapEntries();
assert.deepEqual(
  sitemap.map(({locale, slug}) => `${locale}:${slug}`).sort(),
  ["de:deutscher-beitrag", "en:existing-english"],
);

const operation = await beginPostTranslation(legacyId, "de", false);
assert.equal((await getPostById(legacyId))?.translationStatus, "translating");
const translatedDraft = await completePostTranslation({
  sourceId: legacyId,
  targetLocale: "de",
  operationId: operation.operationId,
  actor: "test@example.com",
  translated: {
    title: "Bestehender englischer Beitrag",
    excerpt: "Auszug",
    content: "Inhalt",
    coverAlt: "Titelbild",
    seoTitle: "Bestehender englischer Beitrag",
    seoDescription: "Auszug",
  },
});
assert.equal(translatedDraft.locale, "de");
assert.equal(translatedDraft.status, "draft");
assert.equal(translatedDraft.publishedAt, null);
assert.equal(translatedDraft.scheduledAt, null);
assert.equal(translatedDraft.sourcePostId, legacyId);
assert.equal(translatedDraft.translationGroupId, legacy?.translationGroupId);
assert.equal((await getPostById(legacyId))?.translationStatus, "ready");

await assert.rejects(
  () => beginPostTranslation(legacyId, "de", false),
  (error) => error instanceof BlogTranslationError && error.code === "overwrite_required",
);
const retry = await beginPostTranslation(legacyId, "de", true);
await failPostTranslation(legacyId, retry.operationId, `provider failure ${"x".repeat(500)}`);
const failed = await getPostById(legacyId);
assert.equal(failed?.translationStatus, "failed");
assert.equal((failed?.translationError?.length || 0) <= 300, true);

console.log("content localization migration and queries: ok");
