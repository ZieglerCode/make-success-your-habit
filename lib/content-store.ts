import {randomUUID} from "node:crypto";
import {mkdirSync} from "node:fs";
import path from "node:path";
import {createClient, type Client} from "@libsql/client";
import postgres from "postgres";
import {slugify} from "@/lib/slug";
import {hasPostChanged, revisionSnapshot, type PostRevision} from "@/lib/post-revisions";
import {
  parseBlogLocale,
  parseTranslationStatus,
  type BlogLocale,
  type TranslationStatus,
} from "@/lib/blog-localization";
import {
  BlogTranslationError,
  sanitizeTranslationError,
  type CompleteBlogTranslation,
} from "@/lib/blog-translation";

export type PostStatus = "draft" | "review" | "scheduled" | "published" | "archived";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverAlt: string;
  status: PostStatus;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
  authorName: string;
  category: string;
  tags: string;
  readingMinutes: number;
  locale: BlogLocale;
  translationGroupId: string;
  sourcePostId: string | null;
  translationStatus: TranslationStatus;
  translationError: string | null;
  translationUpdatedAt: string | null;
};

export type SiteContent = {
  ctaHeadline: string;
  ctaText: string;
  footerEmail: string;
  seoTitle: string;
  seoDescription: string;
};

export type MediaAsset = {
  id: string;
  filename: string;
  url: string;
  alt: string;
  mimeType: string;
  size: number;
  createdAt: string;
  originalUrl: string;
  variants: Record<string, {url: string; width: number; height: number}>;
  width: number | null;
  height: number | null;
  focalX: number;
  focalY: number;
};

export type MaintenanceRun = {id:string; type:string; status:"running"|"success"|"failed"; startedAt:string; finishedAt:string|null; details:Record<string, unknown>; error:string|null};

type Provider = "postgres" | "libsql";

export type ListPostsOptions = {
  includeArchived?: boolean;
  publishedOnly?: boolean;
  q?: string;
  status?: PostStatus | "all";
  sort?: "newest" | "oldest" | "updated" | "title";
  limit?: number;
  offset?: number;
  locale?: BlogLocale;
};

const DEFAULT_AUTHOR = "Heike Ziegler";

const DB_DIR =
  process.env.VERCEL && !process.env.CONTENT_DB_DIR
    ? path.join("/tmp", "make-success-your-habit-content-db")
    : path.join(process.env.CONTENT_DB_DIR || process.cwd(), "content-db");
const DB_PATH = path.join(DB_DIR, "site.sqlite");

const DEFAULT_SITE_CONTENT: SiteContent = {
  ctaHeadline: "Quiet thoughts on success, identity, and inner leadership.",
  ctaText:
    "The blog shares essays and impulses for women who want to shape their next phase of growth through clarity and self-leadership, not pressure.",
  footerEmail: "hello@make-success-your-habit.com",
  seoTitle: "Make Success Your Habit | Heike Ziegler",
  seoDescription:
    "A premium transformation space for ambitious founders, coaches, and experts.",
};

let pg: ReturnType<typeof postgres> | null = null;
let libsql: Client | null = null;
let initialized: Promise<void> | null = null;

function provider(): Provider {
  if (postgresUrl()) return "postgres";
  return "libsql";
}

function postgresUrl() {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
}

function libsqlClient() {
  if (libsql) return libsql;

  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (tursoUrl) {
    libsql = createClient({
      authToken: process.env.TURSO_AUTH_TOKEN,
      url: tursoUrl,
    });
    return libsql;
  }

  mkdirSync(DB_DIR, {recursive: true});
  libsql = createClient({url: `file:${DB_PATH}`});
  return libsql;
}

function pgClient() {
  if (pg) return pg;

  const url = postgresUrl();
  if (!url) throw new Error("No Postgres connection URL configured.");

  pg = postgres(url, {
    max: 3,
    prepare: false,
  });
  return pg;
}

async function ensureInitialized() {
  initialized ||= initialize();
  return initialized;
}

async function initialize() {
  if (provider() === "postgres") {
    const sql = pgClient();

    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        "coverImage" TEXT NOT NULL,
        "coverAlt" TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL,
        "publishedAt" TEXT,
        "scheduledAt" TEXT,
        "createdAt" TEXT NOT NULL,
        "updatedAt" TEXT NOT NULL,
        "seoTitle" TEXT NOT NULL,
        "seoDescription" TEXT NOT NULL,
        "authorName" TEXT NOT NULL DEFAULT 'Heike Ziegler',
        category TEXT NOT NULL DEFAULT '',
        tags TEXT NOT NULL DEFAULT '',
        "readingMinutes" INTEGER NOT NULL DEFAULT 1
        ,locale TEXT NOT NULL DEFAULT 'en'
        ,"translationGroupId" TEXT NOT NULL
        ,"sourcePostId" TEXT
        ,"translationStatus" TEXT NOT NULL DEFAULT 'none'
        ,"translationError" TEXT
        ,"translationUpdatedAt" TEXT
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS site_content (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS media_assets (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        url TEXT NOT NULL,
        alt TEXT NOT NULL,
        "mimeType" TEXT NOT NULL,
        size INTEGER NOT NULL,
        "createdAt" TEXT NOT NULL,
        "originalUrl" TEXT NOT NULL DEFAULT '',
        variants TEXT NOT NULL DEFAULT '{}',
        width INTEGER,
        height INTEGER,
        "focalX" REAL NOT NULL DEFAULT 0.5,
        "focalY" REAL NOT NULL DEFAULT 0.5
      )
    `;
    await sql`CREATE TABLE IF NOT EXISTS post_revisions (
      id TEXT PRIMARY KEY, "postId" TEXT NOT NULL, "createdAt" TEXT NOT NULL, actor TEXT NOT NULL,
      action TEXT NOT NULL, title TEXT NOT NULL, slug TEXT NOT NULL, status TEXT NOT NULL, snapshot TEXT NOT NULL
    )`;
    await sql`CREATE INDEX IF NOT EXISTS post_revisions_post_created ON post_revisions ("postId", "createdAt" DESC)`;
    await sql`CREATE TABLE IF NOT EXISTS maintenance_runs (id TEXT PRIMARY KEY, type TEXT NOT NULL, status TEXT NOT NULL, "startedAt" TEXT NOT NULL, "finishedAt" TEXT, details TEXT NOT NULL DEFAULT '{}', error TEXT)`;
    await sql`CREATE INDEX IF NOT EXISTS maintenance_runs_type_started ON maintenance_runs (type, "startedAt" DESC)`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS maintenance_one_running ON maintenance_runs (type) WHERE status='running'`;
  } else {
    const sql = libsqlClient();

    await sql.batch([
      `CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        coverImage TEXT NOT NULL,
        coverAlt TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL,
        publishedAt TEXT,
        scheduledAt TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        seoTitle TEXT NOT NULL,
        seoDescription TEXT NOT NULL,
        authorName TEXT NOT NULL DEFAULT 'Heike Ziegler',
        category TEXT NOT NULL DEFAULT '',
        tags TEXT NOT NULL DEFAULT '',
        readingMinutes INTEGER NOT NULL DEFAULT 1
        ,locale TEXT NOT NULL DEFAULT 'en'
        ,translationGroupId TEXT NOT NULL
        ,sourcePostId TEXT
        ,translationStatus TEXT NOT NULL DEFAULT 'none'
        ,translationError TEXT
        ,translationUpdatedAt TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS site_content (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS media_assets (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        url TEXT NOT NULL,
        alt TEXT NOT NULL,
        mimeType TEXT NOT NULL,
        size INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        originalUrl TEXT NOT NULL DEFAULT '',
        variants TEXT NOT NULL DEFAULT '{}',
        width INTEGER,
        height INTEGER,
        focalX REAL NOT NULL DEFAULT 0.5,
        focalY REAL NOT NULL DEFAULT 0.5
      )`,
      `CREATE TABLE IF NOT EXISTS post_revisions (
        id TEXT PRIMARY KEY, postId TEXT NOT NULL, createdAt TEXT NOT NULL, actor TEXT NOT NULL,
        action TEXT NOT NULL, title TEXT NOT NULL, slug TEXT NOT NULL, status TEXT NOT NULL, snapshot TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS post_revisions_post_created ON post_revisions (postId, createdAt DESC)`,
      `CREATE TABLE IF NOT EXISTS maintenance_runs (id TEXT PRIMARY KEY, type TEXT NOT NULL, status TEXT NOT NULL, startedAt TEXT NOT NULL, finishedAt TEXT, details TEXT NOT NULL DEFAULT '{}', error TEXT)`,
      `CREATE INDEX IF NOT EXISTS maintenance_runs_type_started ON maintenance_runs (type, startedAt DESC)`,
      `CREATE UNIQUE INDEX IF NOT EXISTS maintenance_one_running ON maintenance_runs (type) WHERE status='running'`,
    ]);
  }

  await ensurePostEditorialColumns();
  await ensurePostLocalizationColumns();
  await ensureMediaColumns();
  await seed();
}

async function ensurePostLocalizationColumns() {
  const columns = [
    {name: "locale", definition: "TEXT NOT NULL DEFAULT 'en'"},
    {name: "translationGroupId", definition: "TEXT"},
    {name: "sourcePostId", definition: "TEXT"},
    {name: "translationStatus", definition: "TEXT NOT NULL DEFAULT 'none'"},
    {name: "translationError", definition: "TEXT"},
    {name: "translationUpdatedAt", definition: "TEXT"},
  ];

  if (provider() === "postgres") {
    const sql = pgClient();
    for (const column of columns) {
      await sql.unsafe(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS "${column.name}" ${column.definition}`);
    }
    await sql`UPDATE posts SET locale = 'en' WHERE locale IS NULL OR locale NOT IN ('de', 'en')`;
    await sql`UPDATE posts SET "translationGroupId" = id WHERE "translationGroupId" IS NULL OR "translationGroupId" = ''`;
    await sql.unsafe('ALTER TABLE posts ALTER COLUMN "translationGroupId" SET NOT NULL');
    await sql.unsafe('CREATE INDEX IF NOT EXISTS posts_locale_status_published ON posts (locale, status, "publishedAt")');
    await sql.unsafe('CREATE UNIQUE INDEX IF NOT EXISTS posts_locale_slug ON posts (locale, slug)');
    await sql.unsafe('CREATE INDEX IF NOT EXISTS posts_translation_group ON posts ("translationGroupId")');
    return;
  }

  const sql = libsqlClient();
  for (const column of columns) {
    try {
      await sql.execute(`ALTER TABLE posts ADD COLUMN ${column.name} ${column.definition}`);
    } catch (error) {
      if (!(error instanceof Error) || !/duplicate column|already exists/i.test(error.message)) throw error;
    }
  }
  await sql.execute("UPDATE posts SET locale = 'en' WHERE locale IS NULL OR locale NOT IN ('de', 'en')");
  await sql.execute("UPDATE posts SET translationGroupId = id WHERE translationGroupId IS NULL OR translationGroupId = ''");
  await sql.batch([
    "CREATE INDEX IF NOT EXISTS posts_locale_status_published ON posts (locale, status, publishedAt)",
    "CREATE UNIQUE INDEX IF NOT EXISTS posts_locale_slug ON posts (locale, slug)",
    "CREATE INDEX IF NOT EXISTS posts_translation_group ON posts (translationGroupId)",
  ]);
}

async function ensureMediaColumns() {
  const columns = [
    {name: "originalUrl", definition: "TEXT NOT NULL DEFAULT ''"},
    {name: "variants", definition: "TEXT NOT NULL DEFAULT '{}'"},
    {name: "width", definition: "INTEGER"},
    {name: "height", definition: "INTEGER"},
    {name: "focalX", definition: "REAL NOT NULL DEFAULT 0.5"},
    {name: "focalY", definition: "REAL NOT NULL DEFAULT 0.5"},
  ];
  if (provider() === "postgres") {
    for (const column of columns) {
      await pgClient().unsafe(`ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS "${column.name}" ${column.definition}`);
    }
    return;
  }
  for (const column of columns) {
    try {
      await libsqlClient().execute(`ALTER TABLE media_assets ADD COLUMN ${column.name} ${column.definition}`);
    } catch (error) {
      if (!(error instanceof Error) || !/duplicate column|already exists/i.test(error.message)) throw error;
    }
  }
}

async function ensurePostEditorialColumns() {
  const columns = [
    {name: "coverAlt", definition: "TEXT NOT NULL DEFAULT ''"},
    {name: "scheduledAt", definition: "TEXT"},
    {name: "authorName", definition: `TEXT NOT NULL DEFAULT '${DEFAULT_AUTHOR}'`},
    {name: "category", definition: "TEXT NOT NULL DEFAULT ''"},
    {name: "tags", definition: "TEXT NOT NULL DEFAULT ''"},
    {name: "readingMinutes", definition: "INTEGER NOT NULL DEFAULT 1"},
  ];

  if (provider() === "postgres") {
    const sql = pgClient();
    for (const column of columns) {
      await sql.unsafe(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS "${column.name}" ${column.definition}`);
    }
    return;
  }

  const sql = libsqlClient();
  for (const column of columns) {
    try {
      await sql.execute(`ALTER TABLE posts ADD COLUMN ${column.name} ${column.definition}`);
    } catch (error) {
      if (!(error instanceof Error) || !/duplicate column|already exists/i.test(error.message)) {
        throw error;
      }
    }
  }
}

async function seed() {
  const siteContentCount = await countRows("site_content");
  if (!siteContentCount) {
    await Promise.all(
      Object.entries(DEFAULT_SITE_CONTENT).map(([key, value]) => upsertSiteContent(key, value)),
    );
  }

  const postCount = await countRows("posts");
  if (!postCount) {
    await insertPost(buildPost({
      title: "Success begins where pressure stops leading",
      slug: "success-begins-where-pressure-stops-leading",
      excerpt:
        "A quiet impulse on self-leadership, identity, and why sustainable growth first becomes stable within.",
      content:
        "Many women in business try to solve their next phase of growth with more discipline. But sometimes what is needed is not another strategy, but an inner standard that no longer treats success as the exception.\n\nWhen success is meant to become a habit, it needs space, clarity, and an identity that can already carry the new.",
      coverImage: "/media/images/heike-ziegler.webp",
      coverAlt: "Heike Ziegler in a calm portrait setting",
      status: "published",
      seoTitle: "Success begins where pressure stops leading",
      seoDescription: "An impulse from Heike Ziegler on sustainable success without pressure.",
      authorName: DEFAULT_AUTHOR,
      category: "Self-leadership",
      tags: "Success, Identity, Clarity",
    }));
  }
}

async function countRows(table: "posts" | "site_content" | "media_assets") {
  if (provider() === "postgres") {
    const sql = pgClient();
    const [row] = await sql.unsafe(`SELECT COUNT(*)::int as count FROM ${table}`);
    return Number(row?.count || 0);
  }

  const result = await libsqlClient().execute(`SELECT COUNT(*) as count FROM ${table}`);
  return Number(result.rows[0]?.count || 0);
}

function normalizePost(row: Record<string, unknown>): BlogPost {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: String(row.excerpt),
    content: String(row.content),
    coverImage: String(row.coverImage),
    coverAlt: row.coverAlt ? String(row.coverAlt) : "",
    status: String(row.status) as PostStatus,
    publishedAt: row.publishedAt ? String(row.publishedAt) : null,
    scheduledAt: row.scheduledAt ? String(row.scheduledAt) : null,
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
    seoTitle: String(row.seoTitle),
    seoDescription: String(row.seoDescription),
    authorName: row.authorName ? String(row.authorName) : DEFAULT_AUTHOR,
    category: row.category ? String(row.category) : "",
    tags: row.tags ? String(row.tags) : "",
    readingMinutes: Number(row.readingMinutes || estimateReadingMinutes(String(row.content || ""))),
    locale: parseBlogLocale(row.locale) || "en",
    translationGroupId: row.translationGroupId ? String(row.translationGroupId) : String(row.id),
    sourcePostId: row.sourcePostId ? String(row.sourcePostId) : null,
    translationStatus: parseTranslationStatus(row.translationStatus) || "none",
    translationError: row.translationError ? String(row.translationError) : null,
    translationUpdatedAt: row.translationUpdatedAt ? String(row.translationUpdatedAt) : null,
  };
}

function normalizeAsset(row: Record<string, unknown>): MediaAsset {
  let variants: MediaAsset["variants"] = {};
  try {
    variants = typeof row.variants === "string" ? JSON.parse(row.variants) : (row.variants as MediaAsset["variants"]) || {};
  } catch {}
  return {
    id: String(row.id),
    filename: String(row.filename),
    url: String(row.url),
    alt: String(row.alt),
    mimeType: String(row.mimeType),
    size: Number(row.size),
    createdAt: String(row.createdAt),
    originalUrl: row.originalUrl ? String(row.originalUrl) : String(row.url),
    variants,
    width: row.width == null ? null : Number(row.width),
    height: row.height == null ? null : Number(row.height),
    focalX: Number(row.focalX ?? 0.5),
    focalY: Number(row.focalY ?? 0.5),
  };
}

export async function listPosts(options: ListPostsOptions = {}) {
  await ensureInitialized();
  await publishDueScheduledPosts();

  const clauses: string[] = [];
  const args: Array<string | number> = [];

  if (options.publishedOnly) {
    clauses.push("status = 'published'");
    clauses.push(provider() === "postgres" ? `"publishedAt" IS NOT NULL AND "publishedAt" <= ?` : "publishedAt IS NOT NULL AND publishedAt <= ?");
    args.push(new Date().toISOString());
  } else if (options.status && options.status !== "all") {
    clauses.push("status = ?");
    args.push(options.status);
  } else if (!options.includeArchived) {
    clauses.push("status != 'archived'");
  }

  if (options.locale) {
    clauses.push("locale = ?");
    args.push(options.locale);
  }

  const query = options.q?.trim();
  if (query) {
    clauses.push("(lower(title) LIKE ? OR lower(excerpt) LIKE ? OR lower(slug) LIKE ? OR lower(tags) LIKE ?)");
    const like = `%${query.toLowerCase()}%`;
    args.push(like, like, like, like);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const orderBy = postOrderBy(options.sort, provider());
  const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : null;
  const offset = options.offset && options.offset > 0 ? options.offset : 0;
  const pagination = limit ? ` LIMIT ${limit} OFFSET ${offset}` : "";

  if (provider() === "postgres") {
    const rows = await pgClient().unsafe(`SELECT * FROM posts ${toPostgresWhere(where)} ${orderBy}${pagination}`, args);
    return rows.map((row) => normalizePost(row));
  }

  const result = await libsqlClient().execute(
    {sql: `SELECT * FROM posts ${where} ${orderBy}${pagination}`, args},
  );
  return result.rows.map((row) => normalizePost(row));
}

export async function countPublishedPosts(locale: BlogLocale) {
  await ensureInitialized();
  await publishDueScheduledPosts();
  const now = new Date().toISOString();

  if (provider() === "postgres") {
    const [row] = await pgClient()`SELECT COUNT(*) AS count FROM posts
      WHERE locale = ${locale} AND status = 'published'
      AND "publishedAt" IS NOT NULL AND "publishedAt" <= ${now}`;
    return Number(row?.count || 0);
  }

  const result = await libsqlClient().execute({
    sql: "SELECT COUNT(*) AS count FROM posts WHERE locale = ? AND status = 'published' AND publishedAt IS NOT NULL AND publishedAt <= ?",
    args: [locale, now],
  });
  return Number(result.rows[0]?.count || 0);
}

function toPostgresWhere(where: string) {
  let index = 0;
  return where.replace(/\?/g, () => `$${++index}`);
}

function postOrderBy(sort: ListPostsOptions["sort"], currentProvider: Provider) {
  const publishedAt = currentProvider === "postgres" ? `"publishedAt"` : "publishedAt";
  const updatedAt = currentProvider === "postgres" ? `"updatedAt"` : "updatedAt";

  switch (sort) {
    case "oldest":
      return `ORDER BY COALESCE(${publishedAt}, ${updatedAt}) ASC`;
    case "title":
      return "ORDER BY lower(title) ASC";
    case "updated":
      return `ORDER BY ${updatedAt} DESC`;
    case "newest":
    default:
      return `ORDER BY COALESCE(${publishedAt}, ${updatedAt}) DESC`;
  }
}

export async function getPostById(id: string) {
  await ensureInitialized();
  await publishDueScheduledPosts();

  if (provider() === "postgres") {
    const [row] = await pgClient()`SELECT * FROM posts WHERE id = ${id}`;
    return row ? normalizePost(row) : undefined;
  }

  const result = await libsqlClient().execute({sql: "SELECT * FROM posts WHERE id = ?", args: [id]});
  return result.rows[0] ? normalizePost(result.rows[0]) : undefined;
}

export async function getPostBySlug(slug: string) {
  await ensureInitialized();
  await publishDueScheduledPosts();

  if (provider() === "postgres") {
    const [row] = await pgClient()`SELECT * FROM posts WHERE slug = ${slug} AND status = 'published'`;
    return row ? normalizePost(row) : undefined;
  }

  const result = await libsqlClient().execute({
    sql: "SELECT * FROM posts WHERE slug = ? AND status = 'published'",
    args: [slug],
  });
  return result.rows[0] ? normalizePost(result.rows[0]) : undefined;
}

export async function getPublishedPostByLocaleSlug(locale: BlogLocale, slug: string) {
  await ensureInitialized();
  await publishDueScheduledPosts();
  const now = new Date().toISOString();
  if (provider() === "postgres") {
    const [row] = await pgClient()`SELECT * FROM posts
      WHERE locale = ${locale} AND slug = ${slug} AND status = 'published'
      AND "publishedAt" IS NOT NULL AND "publishedAt" <= ${now}`;
    return row ? normalizePost(row) : undefined;
  }
  const result = await libsqlClient().execute({
    sql: "SELECT * FROM posts WHERE locale = ? AND slug = ? AND status = 'published' AND publishedAt IS NOT NULL AND publishedAt <= ?",
    args: [locale, slug, now],
  });
  return result.rows[0] ? normalizePost(result.rows[0]) : undefined;
}

export async function getTranslationCounterpart(postId: string) {
  const post = await getPostById(postId);
  if (!post) return undefined;
  if (provider() === "postgres") {
    const [row] = await pgClient()`SELECT * FROM posts WHERE "translationGroupId" = ${post.translationGroupId} AND id != ${post.id} LIMIT 1`;
    return row ? normalizePost(row) : undefined;
  }
  const result = await libsqlClient().execute({
    sql: "SELECT * FROM posts WHERE translationGroupId = ? AND id != ? LIMIT 1",
    args: [post.translationGroupId, post.id],
  });
  return result.rows[0] ? normalizePost(result.rows[0]) : undefined;
}

async function setTranslationState(
  sourceId: string,
  next: Pick<BlogPost, "translationStatus" | "translationError" | "translationUpdatedAt">,
  expected?: Pick<BlogPost, "translationStatus" | "translationUpdatedAt">,
) {
  const expectedClause = expected
    ? provider() === "postgres"
      ? ` AND "translationStatus" = $5 AND COALESCE("translationUpdatedAt", '') = COALESCE($6, '')`
      : " AND translationStatus = ? AND COALESCE(translationUpdatedAt, '') = COALESCE(?, '')"
    : "";
  const args: Array<string | null> = [
    next.translationStatus,
    next.translationError,
    next.translationUpdatedAt,
    sourceId,
  ];
  if (expected) args.push(expected.translationStatus, expected.translationUpdatedAt);

  if (provider() === "postgres") {
    const result = await pgClient().unsafe(
      `UPDATE posts SET "translationStatus" = $1, "translationError" = $2, "translationUpdatedAt" = $3 WHERE id = $4${expectedClause}`,
      args,
    );
    return result.count === 1;
  }

  const result = await libsqlClient().execute({
    sql: `UPDATE posts SET translationStatus = ?, translationError = ?, translationUpdatedAt = ? WHERE id = ?${expectedClause}`,
    args,
  });
  return result.rowsAffected === 1;
}

export async function beginPostTranslation(
  sourceId: string,
  targetLocale: BlogLocale,
  confirmOverwrite: boolean,
) {
  const source = await getPostById(sourceId);
  if (!source) throw new BlogTranslationError("not_found", "Source post not found.", 404);
  if (targetLocale === source.locale) {
    throw new BlogTranslationError("invalid_target", "Target locale must differ from source locale.", 400);
  }
  if (source.translationStatus === "translating") {
    throw new BlogTranslationError("translation_in_progress", "A translation is already in progress.", 409);
  }

  const target = await getTranslationCounterpart(sourceId);
  if (target && !confirmOverwrite) {
    throw new BlogTranslationError("overwrite_required", "The existing translation requires overwrite confirmation.", 409);
  }

  const operationId = new Date().toISOString();
  const started = await setTranslationState(sourceId, {
    translationStatus: "translating",
    translationError: null,
    translationUpdatedAt: operationId,
  }, {
    translationStatus: source.translationStatus,
    translationUpdatedAt: source.translationUpdatedAt,
  });
  if (!started) {
    throw new BlogTranslationError("translation_in_progress", "The source post changed before translation started.", 409);
  }
  return {operationId};
}

async function availableTranslationSlug(title: string, excludeId?: string) {
  const base = slugify(title) || "translation";
  for (let suffix = 1; suffix < 1000; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    if (provider() === "postgres") {
      const [row] = excludeId
        ? await pgClient()`SELECT id FROM posts WHERE slug = ${candidate} AND id != ${excludeId} LIMIT 1`
        : await pgClient()`SELECT id FROM posts WHERE slug = ${candidate} LIMIT 1`;
      if (!row) return candidate;
    } else {
      const result = await libsqlClient().execute({
        sql: excludeId
          ? "SELECT id FROM posts WHERE slug = ? AND id != ? LIMIT 1"
          : "SELECT id FROM posts WHERE slug = ? LIMIT 1",
        args: excludeId ? [candidate, excludeId] : [candidate],
      });
      if (!result.rows[0]) return candidate;
    }
  }
  throw new Error("Could not allocate a translation slug.");
}

export async function completePostTranslation(operation: CompleteBlogTranslation) {
  const source = await getPostById(operation.sourceId);
  if (!source) throw new BlogTranslationError("not_found", "Source post not found.", 404);
  if (
    source.translationStatus !== "translating" ||
    source.translationUpdatedAt !== operation.operationId
  ) {
    throw new BlogTranslationError("translation_in_progress", "The translation operation is no longer current.", 409);
  }

  const existing = await getTranslationCounterpart(source.id);
  const slug = await availableTranslationSlug(operation.translated.title, existing?.id);
  const targetInput: Partial<BlogPost> = {
    ...operation.translated,
    slug,
    status: "draft",
    publishedAt: null,
    scheduledAt: null,
    locale: operation.targetLocale,
    translationGroupId: source.translationGroupId,
    sourcePostId: source.id,
    translationStatus: "ready",
    translationError: null,
    translationUpdatedAt: new Date().toISOString(),
    coverImage: source.coverImage,
    authorName: source.authorName,
    category: source.category,
    tags: source.tags,
  };
  const target = existing
    ? await updatePost(existing.id, targetInput, operation.actor, "update")
    : await createPost(targetInput);
  if (!target) throw new Error("The translation target could not be saved.");

  const completed = await setTranslationState(source.id, {
    translationStatus: "ready",
    translationError: null,
    translationUpdatedAt: new Date().toISOString(),
  }, {
    translationStatus: "translating",
    translationUpdatedAt: operation.operationId,
  });
  if (!completed) {
    throw new BlogTranslationError("translation_in_progress", "The translation operation is no longer current.", 409);
  }
  return target;
}

export async function failPostTranslation(sourceId: string, operationId: string, error: string) {
  await setTranslationState(sourceId, {
    translationStatus: "failed",
    translationError: sanitizeTranslationError(error),
    translationUpdatedAt: new Date().toISOString(),
  }, {
    translationStatus: "translating",
    translationUpdatedAt: operationId,
  });
}

export async function listPublishedPostSitemapEntries() {
  await ensureInitialized();
  await publishDueScheduledPosts();
  const now = new Date().toISOString();
  const rows = provider() === "postgres"
    ? await pgClient()`SELECT locale, slug, "updatedAt" FROM posts WHERE status = 'published' AND "publishedAt" IS NOT NULL AND "publishedAt" <= ${now}`
    : (await libsqlClient().execute({
        sql: "SELECT locale, slug, updatedAt FROM posts WHERE status = 'published' AND publishedAt IS NOT NULL AND publishedAt <= ?",
        args: [now],
      })).rows;
  return (rows as Array<Record<string, unknown>>).map((row) => ({
    locale: parseBlogLocale(row.locale) || "en",
    slug: String(row.slug),
    updatedAt: String(row.updatedAt),
  }));
}

export async function publishDueScheduledPosts(date = new Date()) {
  await ensureInitialized();
  const now = date.toISOString();

  if (provider() === "postgres") {
    const result = await pgClient()`
      UPDATE posts
      SET status = 'published', "publishedAt" = COALESCE("scheduledAt", ${now}), "updatedAt" = ${now}
      WHERE status = 'scheduled' AND "scheduledAt" IS NOT NULL AND "scheduledAt" <= ${now}
    `;
    return result.count;
  }

  const result = await libsqlClient().execute({
    sql: `UPDATE posts
      SET status = 'published', publishedAt = COALESCE(scheduledAt, ?), updatedAt = ?
      WHERE status = 'scheduled' AND scheduledAt IS NOT NULL AND scheduledAt <= ?`,
    args: [now, now, now],
  });
  return result.rowsAffected;
}

function buildPost(input: Partial<BlogPost>) {
  const now = new Date().toISOString();
  const id = randomUUID();
  const title = input.title?.trim() || "Unbenannter Entwurf";
  const status = input.status || "draft";
  const publishedAt = status === "published" ? input.publishedAt || now : null;
  const content = input.content?.trim() || "";
  const post: BlogPost = {
    id,
    title,
    slug: input.slug?.trim() || slugify(title),
    excerpt: input.excerpt?.trim() || "",
    content,
    coverImage: input.coverImage?.trim() || "/media/images/heike-ziegler.webp",
    coverAlt: input.coverAlt?.trim() || title,
    status,
    publishedAt,
    scheduledAt: status === "scheduled" ? input.scheduledAt || now : null,
    createdAt: now,
    updatedAt: now,
    seoTitle: input.seoTitle?.trim() || title,
    seoDescription: input.seoDescription?.trim() || input.excerpt?.trim() || "",
    authorName: input.authorName?.trim() || DEFAULT_AUTHOR,
    category: input.category?.trim() || "",
    tags: input.tags?.trim() || "",
    readingMinutes: input.readingMinutes || estimateReadingMinutes(content),
    locale: parseBlogLocale(input.locale) || "en",
    translationGroupId: input.translationGroupId?.trim() || id,
    sourcePostId: input.sourcePostId?.trim() || null,
    translationStatus: parseTranslationStatus(input.translationStatus) || "none",
    translationError: input.translationError?.trim() || null,
    translationUpdatedAt: input.translationUpdatedAt || null,
  };
  return post;
}

async function insertPost(post: BlogPost) {
  if (provider() === "postgres") {
    await pgClient()`
      INSERT INTO posts
        (id, title, slug, excerpt, content, "coverImage", "coverAlt", status, "publishedAt", "scheduledAt", "createdAt", "updatedAt", "seoTitle", "seoDescription", "authorName", category, tags, "readingMinutes", locale, "translationGroupId", "sourcePostId", "translationStatus", "translationError", "translationUpdatedAt")
      VALUES
        (${post.id}, ${post.title}, ${post.slug}, ${post.excerpt}, ${post.content}, ${post.coverImage}, ${post.coverAlt}, ${post.status}, ${post.publishedAt}, ${post.scheduledAt}, ${post.createdAt}, ${post.updatedAt}, ${post.seoTitle}, ${post.seoDescription}, ${post.authorName}, ${post.category}, ${post.tags}, ${post.readingMinutes}, ${post.locale}, ${post.translationGroupId}, ${post.sourcePostId}, ${post.translationStatus}, ${post.translationError}, ${post.translationUpdatedAt})
    `;
  } else {
    await libsqlClient().execute({
      sql: `INSERT INTO posts
        (id, title, slug, excerpt, content, coverImage, coverAlt, status, publishedAt, scheduledAt, createdAt, updatedAt, seoTitle, seoDescription, authorName, category, tags, readingMinutes, locale, translationGroupId, sourcePostId, translationStatus, translationError, translationUpdatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        post.id,
        post.title,
        post.slug,
        post.excerpt,
        post.content,
        post.coverImage,
        post.coverAlt,
        post.status,
        post.publishedAt,
        post.scheduledAt,
        post.createdAt,
        post.updatedAt,
        post.seoTitle,
        post.seoDescription,
        post.authorName,
        post.category,
        post.tags,
        post.readingMinutes,
        post.locale,
        post.translationGroupId,
        post.sourcePostId,
        post.translationStatus,
        post.translationError,
        post.translationUpdatedAt,
      ],
    });
  }

  return post;
}

export async function createPost(input: Partial<BlogPost>) {
  await ensureInitialized();
  return insertPost(buildPost(input));
}

export async function updatePost(id: string, input: Partial<BlogPost>, actor = "System", action: PostRevision["action"] = "update") {
  const existing = await getPostById(id);
  if (!existing) return null;

  const requestedLocale = parseBlogLocale(input.locale);
  if (action !== "restore" && requestedLocale && requestedLocale !== existing.locale) {
    const counterpart = await getTranslationCounterpart(id);
    if (counterpart) {
      throw new Error("A linked post locale cannot be changed.");
    }
  }

  const now = new Date().toISOString();
  const status = input.status || existing.status;
  const publishedAt =
    status === "published" ? input.publishedAt || existing.publishedAt || now : input.publishedAt ?? null;
  const content = input.content?.trim() ?? existing.content;

  const updated: BlogPost = {
    ...existing,
    ...input,
    title: input.title?.trim() || existing.title,
    slug: input.slug?.trim() || existing.slug,
    excerpt: input.excerpt?.trim() ?? existing.excerpt,
    content,
    coverImage: input.coverImage?.trim() || existing.coverImage,
    coverAlt: input.coverAlt?.trim() ?? existing.coverAlt,
    status,
    publishedAt,
    scheduledAt: status === "scheduled" ? input.scheduledAt || existing.scheduledAt || now : input.scheduledAt ?? null,
    updatedAt: now,
    seoTitle: input.seoTitle?.trim() || input.title?.trim() || existing.seoTitle,
    seoDescription: input.seoDescription?.trim() ?? existing.seoDescription,
    authorName: input.authorName?.trim() || existing.authorName,
    category: input.category?.trim() ?? existing.category,
    tags: input.tags?.trim() ?? existing.tags,
    readingMinutes: input.readingMinutes || estimateReadingMinutes(content),
    locale: action === "restore" ? existing.locale : parseBlogLocale(input.locale) || existing.locale,
    translationGroupId: action === "restore" ? existing.translationGroupId : input.translationGroupId?.trim() || existing.translationGroupId,
    sourcePostId: action === "restore" ? existing.sourcePostId : input.sourcePostId === null ? null : input.sourcePostId?.trim() || existing.sourcePostId,
    translationStatus: parseTranslationStatus(input.translationStatus) || existing.translationStatus,
    translationError: input.translationError === null ? null : input.translationError?.trim() || existing.translationError,
    translationUpdatedAt: input.translationUpdatedAt ?? existing.translationUpdatedAt,
  };

  const changed = hasPostChanged(existing, updated);
  if (changed) await savePostRevision(existing, actor, action);

  if (provider() === "postgres") {
    await pgClient()`
      UPDATE posts SET
        title = ${updated.title},
        slug = ${updated.slug},
        excerpt = ${updated.excerpt},
        content = ${updated.content},
        "coverImage" = ${updated.coverImage},
        "coverAlt" = ${updated.coverAlt},
        status = ${updated.status},
        "publishedAt" = ${updated.publishedAt},
        "scheduledAt" = ${updated.scheduledAt},
        "updatedAt" = ${updated.updatedAt},
        "seoTitle" = ${updated.seoTitle},
        "seoDescription" = ${updated.seoDescription},
        "authorName" = ${updated.authorName},
        category = ${updated.category},
        tags = ${updated.tags},
        "readingMinutes" = ${updated.readingMinutes}
        ,locale = ${updated.locale}
        ,"translationGroupId" = ${updated.translationGroupId}
        ,"sourcePostId" = ${updated.sourcePostId}
        ,"translationStatus" = ${updated.translationStatus}
        ,"translationError" = ${updated.translationError}
        ,"translationUpdatedAt" = ${updated.translationUpdatedAt}
      WHERE id = ${id}
    `;
  } else {
    await libsqlClient().execute({
      sql: `UPDATE posts SET title = ?, slug = ?, excerpt = ?, content = ?, coverImage = ?, coverAlt = ?, status = ?,
        publishedAt = ?, scheduledAt = ?, updatedAt = ?, seoTitle = ?, seoDescription = ?, authorName = ?,
        category = ?, tags = ?, readingMinutes = ?, locale = ?, translationGroupId = ?, sourcePostId = ?,
        translationStatus = ?, translationError = ?, translationUpdatedAt = ? WHERE id = ?`,
      args: [
        updated.title,
        updated.slug,
        updated.excerpt,
        updated.content,
        updated.coverImage,
        updated.coverAlt,
        updated.status,
        updated.publishedAt,
        updated.scheduledAt,
        updated.updatedAt,
        updated.seoTitle,
        updated.seoDescription,
        updated.authorName,
        updated.category,
        updated.tags,
        updated.readingMinutes,
        updated.locale,
        updated.translationGroupId,
        updated.sourcePostId,
        updated.translationStatus,
        updated.translationError,
        updated.translationUpdatedAt,
        id,
      ],
    });
  }

  return updated;
}

export async function deletePost(id: string) {
  await ensureInitialized();

  if (provider() === "postgres") {
    await pgClient()`DELETE FROM post_revisions WHERE "postId" = ${id}`;
    const result = await pgClient()`DELETE FROM posts WHERE id = ${id}`;
    return result.count > 0;
  }

  await libsqlClient().execute({sql: "DELETE FROM post_revisions WHERE postId = ?", args: [id]});
  const result = await libsqlClient().execute({sql: "DELETE FROM posts WHERE id = ?", args: [id]});
  return result.rowsAffected > 0;
}

async function savePostRevision(post: BlogPost, actor: string, action: PostRevision["action"]) {
  const revision: PostRevision = {
    id: randomUUID(), postId: post.id, createdAt: new Date().toISOString(), actor, action,
    title: post.title, slug: post.slug, status: post.status, snapshot: revisionSnapshot(post),
  };
  const snapshot = JSON.stringify(revision.snapshot);
  if (provider() === "postgres") {
    await pgClient()`INSERT INTO post_revisions (id, "postId", "createdAt", actor, action, title, slug, status, snapshot)
      VALUES (${revision.id}, ${revision.postId}, ${revision.createdAt}, ${revision.actor}, ${revision.action}, ${revision.title}, ${revision.slug}, ${revision.status}, ${snapshot})`;
    await pgClient()`DELETE FROM post_revisions WHERE id IN (
      SELECT id FROM post_revisions WHERE "postId" = ${post.id} ORDER BY "createdAt" DESC OFFSET 50
    )`;
  } else {
    await libsqlClient().execute({sql: "INSERT INTO post_revisions (id, postId, createdAt, actor, action, title, slug, status, snapshot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", args: [revision.id, revision.postId, revision.createdAt, revision.actor, revision.action, revision.title, revision.slug, revision.status, snapshot]});
    await libsqlClient().execute({sql: "DELETE FROM post_revisions WHERE id IN (SELECT id FROM post_revisions WHERE postId = ? ORDER BY createdAt DESC LIMIT -1 OFFSET 50)", args: [post.id]});
  }
}

function normalizeRevision(row: Record<string, unknown>): PostRevision {
  return {id:String(row.id), postId:String(row.postId), createdAt:String(row.createdAt), actor:String(row.actor), action:String(row.action) as PostRevision["action"], title:String(row.title), slug:String(row.slug), status:String(row.status) as PostStatus, snapshot:JSON.parse(String(row.snapshot)) as PostRevision["snapshot"]};
}

export async function listPostRevisions(postId: string) {
  await ensureInitialized();
  const rows = provider() === "postgres"
    ? await pgClient()`SELECT * FROM post_revisions WHERE "postId" = ${postId} ORDER BY "createdAt" DESC`
    : (await libsqlClient().execute({sql:"SELECT * FROM post_revisions WHERE postId = ? ORDER BY createdAt DESC", args:[postId]})).rows;
  return (rows as Array<Record<string, unknown>>).map(normalizeRevision);
}

export async function getPostRevision(postId: string, revisionId: string) {
  await ensureInitialized();
  const rows = provider() === "postgres"
    ? await pgClient()`SELECT * FROM post_revisions WHERE id = ${revisionId} AND "postId" = ${postId}`
    : (await libsqlClient().execute({sql:"SELECT * FROM post_revisions WHERE id = ? AND postId = ?", args:[revisionId, postId]})).rows;
  return rows[0] ? normalizeRevision(rows[0] as Record<string, unknown>) : null;
}

export async function restorePostRevision(postId: string, revisionId: string, actor: string) {
  const revision = await getPostRevision(postId, revisionId);
  if (!revision) return null;
  return updatePost(postId, revision.snapshot, actor, "restore");
}

export async function getSiteContent(): Promise<SiteContent> {
  await ensureInitialized();

  const rows =
    provider() === "postgres"
      ? await pgClient()`SELECT key, value FROM site_content`
      : (await libsqlClient().execute("SELECT key, value FROM site_content")).rows;

  return (rows as Array<Record<string, unknown>>).reduce(
    (content, row) => ({...content, [String(row.key)]: String(row.value)}),
    {...DEFAULT_SITE_CONTENT},
  ) as SiteContent;
}

export async function updateSiteContent(input: Partial<SiteContent>) {
  await ensureInitialized();

  await Promise.all(
    Object.entries(input).map(([key, value]) =>
      typeof value === "string" ? upsertSiteContent(key, value) : Promise.resolve(),
    ),
  );

  return getSiteContent();
}

async function upsertSiteContent(key: string, value: string) {
  if (provider() === "postgres") {
    await pgClient()`
      INSERT INTO site_content (key, value)
      VALUES (${key}, ${value})
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `;
    return;
  }

  await libsqlClient().execute({
    sql: "INSERT INTO site_content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    args: [key, value],
  });
}

export async function listMediaAssets() {
  await ensureInitialized();

  if (provider() === "postgres") {
    const rows = await pgClient()`SELECT * FROM media_assets ORDER BY "createdAt" DESC`;
    return rows.map((row) => normalizeAsset(row));
  }

  const result = await libsqlClient().execute("SELECT * FROM media_assets ORDER BY createdAt DESC");
  return result.rows.map((row) => normalizeAsset(row));
}

export async function getMediaAssetById(id: string) {
  await ensureInitialized();

  if (provider() === "postgres") {
    const [row] = await pgClient()`SELECT * FROM media_assets WHERE id = ${id}`;
    return row ? normalizeAsset(row) : undefined;
  }

  const result = await libsqlClient().execute({sql: "SELECT * FROM media_assets WHERE id = ?", args: [id]});
  return result.rows[0] ? normalizeAsset(result.rows[0]) : undefined;
}

export async function updateMediaAsset(id: string, input: Partial<Pick<MediaAsset, "alt" | "focalX" | "focalY" | "variants">>) {
  await ensureInitialized();
  const existing = await getMediaAssetById(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    alt: input.alt?.trim() ?? existing.alt,
    focalX: Math.max(0, Math.min(1, input.focalX ?? existing.focalX)),
    focalY: Math.max(0, Math.min(1, input.focalY ?? existing.focalY)),
    variants: input.variants ?? existing.variants,
  };

  if (provider() === "postgres") {
    await pgClient()`UPDATE media_assets SET alt = ${updated.alt}, "focalX" = ${updated.focalX}, "focalY" = ${updated.focalY}, variants = ${JSON.stringify(updated.variants)} WHERE id = ${id}`;
  } else {
    await libsqlClient().execute({sql: "UPDATE media_assets SET alt = ?, focalX = ?, focalY = ?, variants = ? WHERE id = ?", args: [updated.alt, updated.focalX, updated.focalY, JSON.stringify(updated.variants), id]});
  }

  return updated;
}

export async function deleteMediaAsset(id: string) {
  await ensureInitialized();

  if (provider() === "postgres") {
    const result = await pgClient()`DELETE FROM media_assets WHERE id = ${id}`;
    return result.count > 0;
  }

  const result = await libsqlClient().execute({sql: "DELETE FROM media_assets WHERE id = ?", args: [id]});
  return result.rowsAffected > 0;
}

export async function createMediaAsset(input: Omit<MediaAsset, "id" | "createdAt"> & {id?: string}) {
  await ensureInitialized();

  const asset: MediaAsset = {
    ...input,
    id: input.id || randomUUID(),
    createdAt: new Date().toISOString(),
  };

  if (provider() === "postgres") {
    await pgClient()`
      INSERT INTO media_assets (id, filename, url, alt, "mimeType", size, "createdAt", "originalUrl", variants, width, height, "focalX", "focalY")
      VALUES (${asset.id}, ${asset.filename}, ${asset.url}, ${asset.alt}, ${asset.mimeType}, ${asset.size}, ${asset.createdAt}, ${asset.originalUrl}, ${JSON.stringify(asset.variants)}, ${asset.width}, ${asset.height}, ${asset.focalX}, ${asset.focalY})
    `;
  } else {
    await libsqlClient().execute({
      sql: "INSERT INTO media_assets (id, filename, url, alt, mimeType, size, createdAt, originalUrl, variants, width, height, focalX, focalY) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [asset.id, asset.filename, asset.url, asset.alt, asset.mimeType, asset.size, asset.createdAt, asset.originalUrl, JSON.stringify(asset.variants), asset.width, asset.height, asset.focalX, asset.focalY],
    });
  }

  return asset;
}

export function contentStorageProvider() {
  if (process.env.TURSO_DATABASE_URL) return "turso";
  if (postgresUrl()) return "postgres";
  return "local-sqlite";
}

function normalizeMaintenance(row: Record<string, unknown>): MaintenanceRun {
  let details: Record<string, unknown> = {};
  try { details = JSON.parse(String(row.details || "{}")); } catch {}
  return {id:String(row.id), type:String(row.type), status:String(row.status) as MaintenanceRun["status"], startedAt:String(row.startedAt), finishedAt:row.finishedAt ? String(row.finishedAt) : null, details, error:row.error ? String(row.error) : null};
}

export async function startMaintenanceRun(type: string) {
  await ensureInitialized();
  const cutoff = new Date(Date.now() - 10 * 60_000).toISOString();
  const expired = "Automatisch beendet: Wartungslauf war länger als 10 Minuten aktiv.";
  if (provider() === "postgres") await pgClient()`UPDATE maintenance_runs SET status='failed', "finishedAt"=${new Date().toISOString()}, error=${expired} WHERE type=${type} AND status='running' AND "startedAt"<${cutoff}`;
  else await libsqlClient().execute({sql:"UPDATE maintenance_runs SET status='failed', finishedAt=?, error=? WHERE type=? AND status='running' AND startedAt<?", args:[new Date().toISOString(),expired,type,cutoff]});
  const run: MaintenanceRun = {id:randomUUID(), type, status:"running", startedAt:new Date().toISOString(), finishedAt:null, details:{}, error:null};
  try {
    if (provider() === "postgres") await pgClient()`INSERT INTO maintenance_runs (id,type,status,"startedAt",details) VALUES (${run.id},${type},'running',${run.startedAt},'{}')`;
    else await libsqlClient().execute({sql:"INSERT INTO maintenance_runs (id,type,status,startedAt,details) VALUES (?,?,?,?,?)", args:[run.id,type,"running",run.startedAt,"{}"]});
    return run;
  } catch (error) {
    if (error instanceof Error && /unique|constraint/i.test(error.message)) return null;
    throw error;
  }
}

export async function finishMaintenanceRun(id:string, details:Record<string, unknown>) {
  await ensureInitialized(); const finishedAt = new Date().toISOString(); const json = JSON.stringify(details);
  if (provider() === "postgres") await pgClient()`UPDATE maintenance_runs SET status='success', "finishedAt"=${finishedAt}, details=${json}, error=NULL WHERE id=${id}`;
  else await libsqlClient().execute({sql:"UPDATE maintenance_runs SET status='success', finishedAt=?, details=?, error=NULL WHERE id=?", args:[finishedAt,json,id]});
  await pruneMaintenanceRuns();
}

export async function failMaintenanceRun(id:string, error:unknown) {
  await ensureInitialized(); const finishedAt = new Date().toISOString(); const safe = (error instanceof Error ? error.message : String(error)).replace(/(?:postgres(?:ql)?:\/\/)[^\s]+/gi, "[database-url]").slice(0,500);
  if (provider() === "postgres") await pgClient()`UPDATE maintenance_runs SET status='failed', "finishedAt"=${finishedAt}, error=${safe} WHERE id=${id}`;
  else await libsqlClient().execute({sql:"UPDATE maintenance_runs SET status='failed', finishedAt=?, error=? WHERE id=?", args:[finishedAt,safe,id]});
  await pruneMaintenanceRuns();
}

async function pruneMaintenanceRuns() {
  const cutoff = new Date(Date.now() - 90*24*60*60_000).toISOString();
  if (provider() === "postgres") await pgClient()`DELETE FROM maintenance_runs WHERE "startedAt" < ${cutoff} AND status <> 'running'`;
  else await libsqlClient().execute({sql:"DELETE FROM maintenance_runs WHERE startedAt < ? AND status <> 'running'", args:[cutoff]});
}

export async function maintenanceStatus() {
  await ensureInitialized();
  const rows = provider() === "postgres"
    ? await pgClient()`SELECT DISTINCT ON (type) * FROM maintenance_runs ORDER BY type, "startedAt" DESC`
    : (await libsqlClient().execute("SELECT r.* FROM maintenance_runs r JOIN (SELECT type, MAX(startedAt) latest FROM maintenance_runs GROUP BY type) x ON r.type=x.type AND r.startedAt=x.latest")).rows;
  return (rows as Array<Record<string, unknown>>).map(normalizeMaintenance);
}

function estimateReadingMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
