import assert from "node:assert/strict";
import type {BlogPost} from "../lib/content-store";
import {
  BLOG_TRANSLATION_FIELDS,
  BlogTranslationError,
  generateBlogTranslationDraft,
  type BlogTranslationRepository,
  type GeminiTranslationClient,
} from "../lib/blog-translation";

const source: BlogPost = {
  id: "source-en",
  title: "Success without pressure",
  slug: "success-without-pressure",
  excerpt: "A precise introduction.",
  content: "## Start\n\nKeep [this link](https://example.com).",
  coverImage: "/media/cover.webp",
  coverAlt: "Portrait of Heike",
  status: "published",
  publishedAt: "2026-07-18T10:00:00.000Z",
  scheduledAt: null,
  createdAt: "2026-07-17T10:00:00.000Z",
  updatedAt: "2026-07-18T10:00:00.000Z",
  seoTitle: "Success without pressure",
  seoDescription: "A precise introduction.",
  authorName: "Heike Ziegler",
  category: "Leadership",
  tags: "success,pressure",
  readingMinutes: 2,
  locale: "en",
  translationGroupId: "group-1",
  sourcePostId: null,
  translationStatus: "none",
  translationError: null,
  translationUpdatedAt: null,
};

const translatedFields = {
  title: "Erfolg ohne Druck",
  excerpt: "Eine präzise Einführung.",
  content: "## Start\n\nBehalte [diesen Link](https://example.com).",
  coverAlt: "Porträt von Heike",
  seoTitle: "Erfolg ohne Druck",
  seoDescription: "Eine präzise Einführung.",
};

function translatedPost(): BlogPost {
  return {
    ...source,
    ...translatedFields,
    id: "target-de",
    locale: "de",
    slug: "erfolg-ohne-druck",
    status: "draft",
    publishedAt: null,
    scheduledAt: null,
    sourcePostId: source.id,
    translationStatus: "ready",
  };
}

function repository(overrides: Partial<BlogTranslationRepository> = {}) {
  const calls = {begin: 0, complete: 0, fail: [] as string[], completion: null as null | Record<string, unknown>};
  const repo: BlogTranslationRepository = {
    async getSource(sourceId) {
      assert.equal(sourceId, source.id);
      return source;
    },
    async begin(sourceId, targetLocale, confirmOverwrite) {
      calls.begin += 1;
      assert.equal(sourceId, source.id);
      assert.equal(targetLocale, "de");
      assert.equal(confirmOverwrite, false);
      return {operationId: `operation-${calls.begin}`};
    },
    async complete(operation) {
      calls.complete += 1;
      calls.completion = operation as unknown as Record<string, unknown>;
      return translatedPost();
    },
    async fail(_sourceId, _operationId, message) {
      calls.fail.push(message);
    },
    ...overrides,
  };
  return {calls, repo};
}

const successfulClient: GeminiTranslationClient = {
  async generate(request) {
    assert.deepEqual(Object.keys(request.source).sort(), [...BLOG_TRANSLATION_FIELDS].sort());
    assert.equal(request.targetLocale, "de");
    assert.match(request.systemInstruction, /translate faithfully/i);
    assert.match(request.systemInstruction, /do not summarize/i);
    assert.match(request.systemInstruction, /preserve headings.*links.*markup.*order/i);
    return JSON.stringify(translatedFields);
  },
};

{
  const {calls, repo} = repository();
  const target = await generateBlogTranslationDraft({
    sourceId: source.id,
    targetLocale: "de",
    confirmOverwrite: false,
    repository: repo,
    client: successfulClient,
  });
  assert.equal(target.status, "draft");
  assert.equal(target.publishedAt, null);
  assert.equal(target.scheduledAt, null);
  assert.equal(calls.complete, 1);
  assert.deepEqual(calls.completion?.translated, translatedFields);
}

await assert.rejects(
  () => generateBlogTranslationDraft({
    sourceId: source.id,
    targetLocale: "en",
    confirmOverwrite: false,
    repository: repository().repo,
    client: successfulClient,
  }),
  (error) => error instanceof BlogTranslationError && error.code === "invalid_target",
);

{
  const {calls, repo} = repository();
  const client: GeminiTranslationClient = {async generate() { return "not-json"; }};
  await assert.rejects(
    () => generateBlogTranslationDraft({sourceId: source.id, targetLocale: "de", confirmOverwrite: false, repository: repo, client}),
    (error) => error instanceof BlogTranslationError && error.code === "invalid_model_output",
  );
  assert.equal(calls.complete, 0);
  assert.equal(calls.fail.length, 1);
  assert.equal(source.translationStatus, "none");
}

{
  const {repo} = repository({
    async begin() {
      throw new BlogTranslationError("overwrite_required", "Existing edited target requires confirmation.", 409);
    },
  });
  await assert.rejects(
    () => generateBlogTranslationDraft({sourceId: source.id, targetLocale: "de", confirmOverwrite: false, repository: repo, client: successfulClient}),
    (error) => error instanceof BlogTranslationError && error.status === 409,
  );
}

{
  const {calls, repo} = repository();
  let attempt = 0;
  const client: GeminiTranslationClient = {
    async generate() {
      attempt += 1;
      if (attempt === 1) throw new Error(`provider secret ${"x".repeat(500)}`);
      return JSON.stringify(translatedFields);
    },
  };
  await assert.rejects(() => generateBlogTranslationDraft({sourceId: source.id, targetLocale: "de", confirmOverwrite: false, repository: repo, client}));
  const target = await generateBlogTranslationDraft({sourceId: source.id, targetLocale: "de", confirmOverwrite: false, repository: repo, client});
  assert.equal(target.status, "draft");
  assert.equal(calls.begin, 2);
  assert.equal(calls.fail[0].length <= 300, true);
}

console.log("blog translation workflow: ok");
