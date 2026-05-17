import {randomUUID} from "node:crypto";
import {mkdirSync} from "node:fs";
import path from "node:path";
import {createClient, type Client} from "@libsql/client";
import postgres from "postgres";
import {slugify} from "@/lib/slug";

export type PostStatus = "draft" | "published" | "archived";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
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

const DB_DIR =
  process.env.VERCEL && !process.env.CONTENT_DB_DIR
    ? path.join("/tmp", "make-success-your-habit-content-db")
    : path.join(process.env.CONTENT_DB_DIR || process.cwd(), "content-db");
const DB_PATH = path.join(DB_DIR, "site.sqlite");

const DEFAULT_SITE_CONTENT: SiteContent = {
  ctaHeadline: "Ruhige Gedanken über Erfolg, Identität und innere Führung.",
  ctaText:
    "Im Blog entstehen Essays und Impulse für Frauen, die ihr nächstes Wachstum nicht über Druck, sondern über Klarheit und Selbstführung gestalten möchten.",
  footerEmail: "hello@make-success-your-habit.com",
  seoTitle: "Make Success Your Habit | Heike Ziegler",
  seoDescription:
    "Premium-Transformationsraum für ambitionierte Unternehmerinnen, Coaches und Expertinnen.",
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
        status TEXT NOT NULL,
        "publishedAt" TEXT,
        "createdAt" TEXT NOT NULL,
        "updatedAt" TEXT NOT NULL,
        "seoTitle" TEXT NOT NULL,
        "seoDescription" TEXT NOT NULL
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
        status TEXT NOT NULL,
        publishedAt TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        seoTitle TEXT NOT NULL,
        seoDescription TEXT NOT NULL
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

  await seed();
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
      title: "Erfolg beginnt dort, wo Druck nicht mehr führt",
      slug: "erfolg-beginnt-ohne-druck",
      excerpt:
        "Ein ruhiger Impuls über Selbstführung, Identität und die Frage, warum nachhaltiges Wachstum zuerst im Inneren stabil wird.",
      content:
        "Viele Unternehmerinnen versuchen, ihr nächstes Wachstum mit mehr Disziplin zu lösen. Doch manchmal ist nicht mehr Strategie nötig, sondern ein innerer Standard, der Erfolg nicht länger als Ausnahme behandelt.\n\nWenn Erfolg zur Gewohnheit werden soll, braucht er Raum, Klarheit und eine Identität, die das Neue bereits tragen kann.",
      coverImage: "/media/images/heike-ziegler.webp",
      status: "published",
      seoTitle: "Erfolg beginnt dort, wo Druck nicht mehr führt",
      seoDescription: "Ein Impuls von Heike Ziegler über nachhaltigen Erfolg ohne Druck.",
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
    status: String(row.status) as PostStatus,
    publishedAt: row.publishedAt ? String(row.publishedAt) : null,
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
    seoTitle: String(row.seoTitle),
    seoDescription: String(row.seoDescription),
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

export async function listPosts(options: {includeArchived?: boolean; publishedOnly?: boolean} = {}) {
  await ensureInitialized();

  const where = options.publishedOnly
    ? "WHERE status = 'published'"
    : options.includeArchived
      ? ""
      : "WHERE status != 'archived'";

  if (provider() === "postgres") {
    const rows = await pgClient().unsafe(
      `SELECT * FROM posts ${where} ORDER BY COALESCE("publishedAt", "updatedAt") DESC`,
    );
    return rows.map((row) => normalizePost(row));
  }

  const result = await libsqlClient().execute(
    `SELECT * FROM posts ${where} ORDER BY COALESCE(publishedAt, updatedAt) DESC`,
  );
  return result.rows.map((row) => normalizePost(row));
}

export async function getPostById(id: string) {
  await ensureInitialized();

  if (provider() === "postgres") {
    const [row] = await pgClient()`SELECT * FROM posts WHERE id = ${id}`;
    return row ? normalizePost(row) : undefined;
  }

  const result = await libsqlClient().execute({sql: "SELECT * FROM posts WHERE id = ?", args: [id]});
  return result.rows[0] ? normalizePost(result.rows[0]) : undefined;
}

export async function getPostBySlug(slug: string) {
  await ensureInitialized();

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

function buildPost(input: Partial<BlogPost>) {
  const now = new Date().toISOString();
  const id = randomUUID();
  const title = input.title?.trim() || "Unbenannter Entwurf";
  const status = input.status || "draft";
  const publishedAt = status === "published" ? input.publishedAt || now : null;
  const post: BlogPost = {
    id,
    title,
    slug: input.slug?.trim() || slugify(title),
    excerpt: input.excerpt?.trim() || "",
    content: input.content?.trim() || "",
    coverImage: input.coverImage?.trim() || "/media/images/heike-ziegler.webp",
    status,
    publishedAt,
    createdAt: now,
    updatedAt: now,
    seoTitle: input.seoTitle?.trim() || title,
    seoDescription: input.seoDescription?.trim() || input.excerpt?.trim() || "",
  };
  return post;
}

async function insertPost(post: BlogPost) {
  if (provider() === "postgres") {
    await pgClient()`
      INSERT INTO posts
        (id, title, slug, excerpt, content, "coverImage", status, "publishedAt", "createdAt", "updatedAt", "seoTitle", "seoDescription")
      VALUES
        (${post.id}, ${post.title}, ${post.slug}, ${post.excerpt}, ${post.content}, ${post.coverImage}, ${post.status}, ${post.publishedAt}, ${post.createdAt}, ${post.updatedAt}, ${post.seoTitle}, ${post.seoDescription})
    `;
  } else {
    await libsqlClient().execute({
      sql: `INSERT INTO posts
        (id, title, slug, excerpt, content, coverImage, status, publishedAt, createdAt, updatedAt, seoTitle, seoDescription)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        post.id,
        post.title,
        post.slug,
        post.excerpt,
        post.content,
        post.coverImage,
        post.status,
        post.publishedAt,
        post.createdAt,
        post.updatedAt,
        post.seoTitle,
        post.seoDescription,
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

  const updated: BlogPost = {
    ...existing,
    ...input,
    title: input.title?.trim() || existing.title,
    slug: input.slug?.trim() || existing.slug,
    excerpt: input.excerpt?.trim() ?? existing.excerpt,
    content: input.content?.trim() ?? existing.content,
    coverImage: input.coverImage?.trim() || existing.coverImage,
    status,
    publishedAt,
    updatedAt: now,
    seoTitle: input.seoTitle?.trim() || input.title?.trim() || existing.seoTitle,
    seoDescription: input.seoDescription?.trim() ?? existing.seoDescription,
  };

  if (provider() === "postgres") {
    await pgClient()`
      UPDATE posts SET
        title = ${updated.title},
        slug = ${updated.slug},
        excerpt = ${updated.excerpt},
        content = ${updated.content},
        "coverImage" = ${updated.coverImage},
        status = ${updated.status},
        "publishedAt" = ${updated.publishedAt},
        "updatedAt" = ${updated.updatedAt},
        "seoTitle" = ${updated.seoTitle},
        "seoDescription" = ${updated.seoDescription}
      WHERE id = ${id}
    `;
  } else {
    await libsqlClient().execute({
      sql: `UPDATE posts SET title = ?, slug = ?, excerpt = ?, content = ?, coverImage = ?, status = ?,
        publishedAt = ?, updatedAt = ?, seoTitle = ?, seoDescription = ? WHERE id = ?`,
      args: [
        updated.title,
        updated.slug,
        updated.excerpt,
        updated.content,
        updated.coverImage,
        updated.status,
        updated.publishedAt,
        updated.updatedAt,
        updated.seoTitle,
        updated.seoDescription,
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
