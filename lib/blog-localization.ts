export const BLOG_LOCALES = ["de", "en"] as const;
export type BlogLocale = (typeof BLOG_LOCALES)[number];

export const TRANSLATION_STATUSES = ["none", "translating", "ready", "failed"] as const;
export type TranslationStatus = (typeof TRANSLATION_STATUSES)[number];

export function parseBlogLocale(value: unknown): BlogLocale | null {
  return typeof value === "string" && BLOG_LOCALES.includes(value as BlogLocale)
    ? (value as BlogLocale)
    : null;
}

export function oppositeBlogLocale(locale: BlogLocale): BlogLocale {
  return locale === "de" ? "en" : "de";
}

export function parseTranslationStatus(value: unknown): TranslationStatus | null {
  return typeof value === "string" && TRANSLATION_STATUSES.includes(value as TranslationStatus)
    ? (value as TranslationStatus)
    : null;
}

export function localizedSlugKey(locale: BlogLocale, slug: string) {
  return `${locale}:${slug.trim().toLowerCase()}`;
}

type PublicPostSource = {
  authorName: string;
  category: string;
  content: string;
  coverAlt: string;
  coverImage: string;
  excerpt: string;
  locale: BlogLocale;
  publishedAt: string | null;
  readingMinutes: number;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  tags: string;
  title: string;
  updatedAt: string;
};

export function toPublicPost<T extends PublicPostSource>(post: T) {
  return {
    authorName: post.authorName,
    category: post.category,
    content: post.content,
    coverAlt: post.coverAlt,
    coverImage: post.coverImage,
    excerpt: post.excerpt,
    locale: post.locale,
    publishedAt: post.publishedAt,
    readingMinutes: post.readingMinutes,
    seoDescription: post.seoDescription,
    seoTitle: post.seoTitle,
    slug: post.slug,
    tags: post.tags,
    title: post.title,
    updatedAt: post.updatedAt,
  };
}
