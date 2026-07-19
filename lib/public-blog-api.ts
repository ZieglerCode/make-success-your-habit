import {toPublicPost, type BlogLocale} from "@/lib/blog-localization";
import type {BlogPost} from "@/lib/content-store";

export const PUBLIC_SITE_ORIGIN = "https://www.heike-ziegler.com";
export const PUBLIC_CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=300";

export const STATIC_LOCALIZED_ROUTES = [
  "/de",
  "/de/methode",
  "/de/ueber-heike",
  "/de/community",
  "/de/instant-success-formula",
  "/de/isobl",
  "/de/isa-alliance",
  "/de/blog",
  "/de/impressum",
  "/de/datenschutz",
  "/de/agb",
  "/de/nutzungsbedingungen",
  "/de/eula",
  "/de/widerruf",
  "/en",
  "/en/method",
  "/en/about-heike",
  "/en/community",
  "/en/instant-success-formula",
  "/en/isobl",
  "/en/isa-alliance",
  "/en/blog",
  "/en/legal-notice",
  "/en/privacy",
  "/en/terms",
  "/en/terms-of-use",
  "/en/eula",
  "/en/refund-policy",
] as const;

export class PublicBlogApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "PublicBlogApiError";
  }
}

export type PublicPostListQuery = {
  locale: BlogLocale;
  page: number;
  pageSize: number;
};

function positiveInteger(value: string | null, fallback: number) {
  if (value === null || value.trim() === "") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.max(1, parsed) : fallback;
}

export function parsePublicPostListQuery(searchParams: URLSearchParams): PublicPostListQuery {
  const locale = searchParams.get("locale");
  if (locale !== "de" && locale !== "en") {
    throw new PublicBlogApiError("Invalid locale.", 400);
  }

  return {
    locale,
    page: positiveInteger(searchParams.get("page"), 1),
    pageSize: Math.min(50, positiveInteger(searchParams.get("pageSize"), 12)),
  };
}

export function isPubliclyPublished(post: BlogPost | undefined, now = new Date()) {
  if (!post || post.status !== "published" || !post.publishedAt) return false;
  const publishedAt = Date.parse(post.publishedAt);
  return Number.isFinite(publishedAt) && publishedAt <= now.getTime();
}

export function buildPublicPostList(
  posts: BlogPost[],
  pagination: {page: number; pageSize: number; total: number},
) {
  const {page, pageSize, total} = pagination;
  return {
    items: posts.map(toPublicPost),
    page,
    pageSize,
    total,
    nextPage: page * pageSize < total ? page + 1 : null,
  };
}

export function buildPublicPostDetail(
  post: BlogPost | undefined,
  counterpart: BlogPost | undefined,
  now = new Date(),
) {
  if (!isPubliclyPublished(post, now)) return null;

  return {
    item: toPublicPost(post),
    counterpart: isPubliclyPublished(counterpart, now)
      ? {locale: counterpart.locale, slug: counterpart.slug}
      : null,
  };
}

type SitemapEntry = {locale: BlogLocale; slug: string; updatedAt: string};

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function sitemapUrl(pathname: string, lastModified?: string) {
  const loc = escapeXml(`${PUBLIC_SITE_ORIGIN}${pathname}`);
  const lastmod = lastModified ? `<lastmod>${escapeXml(lastModified)}</lastmod>` : "";
  return `<url><loc>${loc}</loc>${lastmod}</url>`;
}

export function buildPublicSitemapXml(entries: SitemapEntry[]) {
  const urls = [
    ...STATIC_LOCALIZED_ROUTES.map((route) => sitemapUrl(route)),
    ...entries.map((entry) =>
      sitemapUrl(`/${entry.locale}/blog/${encodeURIComponent(entry.slug)}`, entry.updatedAt),
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
}

export const PUBLIC_RESPONSE_HEADERS = {
  "Cache-Control": PUBLIC_CACHE_CONTROL,
  Vary: "Accept-Encoding",
} as const;
