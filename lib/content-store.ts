import {randomUUID} from "node:crypto";
import {mkdirSync} from "node:fs";
import path from "node:path";
import {createClient, type Client} from "@libsql/client";
import postgres from "postgres";
import {DEFAULT_COVER_CROPS, normalizeCoverCrops, type CoverCrops} from "@/lib/cover-crop";
import {slugify} from "@/lib/slug";

export type PostStatus = "draft" | "review" | "scheduled" | "published" | "archived";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverAlt: string;
  coverCrops: CoverCrops;
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
};

type Provider = "postgres" | "libsql";

type ListPostsOptions = {
  includeArchived?: boolean;
  publishedOnly?: boolean;
  q?: string;
  status?: PostStatus | "all";
  sort?: "newest" | "oldest" | "updated" | "title";
  limit?: number;
  offset?: number;
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
        "coverCrops" TEXT NOT NULL DEFAULT '{}',
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
        "createdAt" TEXT NOT NULL
      )
    `;
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
        coverCrops TEXT NOT NULL DEFAULT '{}',
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
        createdAt TEXT NOT NULL
      )`,
    ]);
  }

  await ensurePostEditorialColumns();
  await seed();
}

async function ensurePostEditorialColumns() {
  const columns = [
    {name: "coverAlt", definition: "TEXT NOT NULL DEFAULT ''"},
    {name: "coverCrops", definition: "TEXT NOT NULL DEFAULT '{}'"},
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
    coverCrops: normalizeCoverCrops(row.coverCrops),
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
  };
}

function normalizeAsset(row: Record<string, unknown>): MediaAsset {
  return {
    id: String(row.id),
    filename: String(row.filename),
    url: String(row.url),
    alt: String(row.alt),
    mimeType: String(row.mimeType),
    size: Number(row.size),
    createdAt: String(row.createdAt),
  };
}

export async function listPosts(options: ListPostsOptions = {}) {
  await ensureInitialized();
  await publishDueScheduledPosts();

  const clauses: string[] = [];
  const args: Array<string | number> = [];

  if (options.publishedOnly) {
    clauses.push("status = 'published'");
  } else if (options.status && options.status !== "all") {
    clauses.push("status = ?");
    args.push(options.status);
  } else if (!options.includeArchived) {
    clauses.push("status != 'archived'");
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

async function publishDueScheduledPosts() {
  const now = new Date().toISOString();

  if (provider() === "postgres") {
    await pgClient()`
      UPDATE posts
      SET status = 'published', "publishedAt" = COALESCE("scheduledAt", ${now}), "updatedAt" = ${now}
      WHERE status = 'scheduled' AND "scheduledAt" IS NOT NULL AND "scheduledAt" <= ${now}
    `;
    return;
  }

  await libsqlClient().execute({
    sql: `UPDATE posts
      SET status = 'published', publishedAt = COALESCE(scheduledAt, ?), updatedAt = ?
      WHERE status = 'scheduled' AND scheduledAt IS NOT NULL AND scheduledAt <= ?`,
    args: [now, now, now],
  });
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
    coverCrops: normalizeCoverCrops(input.coverCrops || DEFAULT_COVER_CROPS),
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
  };
  return post;
}

async function insertPost(post: BlogPost) {
  if (provider() === "postgres") {
    await pgClient()`
      INSERT INTO posts
        (id, title, slug, excerpt, content, "coverImage", "coverAlt", "coverCrops", status, "publishedAt", "scheduledAt", "createdAt", "updatedAt", "seoTitle", "seoDescription", "authorName", category, tags, "readingMinutes")
      VALUES
        (${post.id}, ${post.title}, ${post.slug}, ${post.excerpt}, ${post.content}, ${post.coverImage}, ${post.coverAlt}, ${JSON.stringify(post.coverCrops)}, ${post.status}, ${post.publishedAt}, ${post.scheduledAt}, ${post.createdAt}, ${post.updatedAt}, ${post.seoTitle}, ${post.seoDescription}, ${post.authorName}, ${post.category}, ${post.tags}, ${post.readingMinutes})
    `;
  } else {
    await libsqlClient().execute({
      sql: `INSERT INTO posts
        (id, title, slug, excerpt, content, coverImage, coverAlt, coverCrops, status, publishedAt, scheduledAt, createdAt, updatedAt, seoTitle, seoDescription, authorName, category, tags, readingMinutes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        post.id,
        post.title,
        post.slug,
        post.excerpt,
        post.content,
        post.coverImage,
        post.coverAlt,
        JSON.stringify(post.coverCrops),
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
      ],
    });
  }

  return post;
}

export async function createPost(input: Partial<BlogPost>) {
  await ensureInitialized();
  return insertPost(buildPost(input));
}

export async function updatePost(id: string, input: Partial<BlogPost>) {
  const existing = await getPostById(id);
  if (!existing) return null;

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
    coverCrops: input.coverCrops ? normalizeCoverCrops(input.coverCrops) : existing.coverCrops,
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
  };

  if (provider() === "postgres") {
    await pgClient()`
      UPDATE posts SET
        title = ${updated.title},
        slug = ${updated.slug},
        excerpt = ${updated.excerpt},
        content = ${updated.content},
        "coverImage" = ${updated.coverImage},
        "coverAlt" = ${updated.coverAlt},
        "coverCrops" = ${JSON.stringify(updated.coverCrops)},
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
      WHERE id = ${id}
    `;
  } else {
    await libsqlClient().execute({
      sql: `UPDATE posts SET title = ?, slug = ?, excerpt = ?, content = ?, coverImage = ?, coverAlt = ?, coverCrops = ?, status = ?,
        publishedAt = ?, scheduledAt = ?, updatedAt = ?, seoTitle = ?, seoDescription = ?, authorName = ?,
        category = ?, tags = ?, readingMinutes = ? WHERE id = ?`,
      args: [
        updated.title,
        updated.slug,
        updated.excerpt,
        updated.content,
        updated.coverImage,
        updated.coverAlt,
        JSON.stringify(updated.coverCrops),
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
        id,
      ],
    });
  }

  return updated;
}

export async function deletePost(id: string) {
  await ensureInitialized();

  if (provider() === "postgres") {
    const result = await pgClient()`DELETE FROM posts WHERE id = ${id}`;
    return result.count > 0;
  }

  const result = await libsqlClient().execute({sql: "DELETE FROM posts WHERE id = ?", args: [id]});
  return result.rowsAffected > 0;
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

export async function updateMediaAsset(id: string, input: Partial<Pick<MediaAsset, "alt">>) {
  await ensureInitialized();
  const existing = await getMediaAssetById(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    alt: input.alt?.trim() ?? existing.alt,
  };

  if (provider() === "postgres") {
    await pgClient()`UPDATE media_assets SET alt = ${updated.alt} WHERE id = ${id}`;
  } else {
    await libsqlClient().execute({sql: "UPDATE media_assets SET alt = ? WHERE id = ?", args: [updated.alt, id]});
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

export async function createMediaAsset(input: Omit<MediaAsset, "id" | "createdAt">) {
  await ensureInitialized();

  const asset: MediaAsset = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };

  if (provider() === "postgres") {
    await pgClient()`
      INSERT INTO media_assets (id, filename, url, alt, "mimeType", size, "createdAt")
      VALUES (${asset.id}, ${asset.filename}, ${asset.url}, ${asset.alt}, ${asset.mimeType}, ${asset.size}, ${asset.createdAt})
    `;
  } else {
    await libsqlClient().execute({
      sql: "INSERT INTO media_assets (id, filename, url, alt, mimeType, size, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [asset.id, asset.filename, asset.url, asset.alt, asset.mimeType, asset.size, asset.createdAt],
    });
  }

  return asset;
}

export function contentStorageProvider() {
  if (process.env.TURSO_DATABASE_URL) return "turso";
  if (postgresUrl()) return "postgres";
  return "local-sqlite";
}

function estimateReadingMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
