import type {BlogPost, MediaAsset, PostStatus} from "@/lib/content-store";

export const statusLabels: Record<PostStatus, string> = {
  archived: "Archiviert",
  draft: "Entwurf",
  published: "Veröffentlicht",
  review: "Review",
  scheduled: "Geplant",
};

export function wordCount(content: string) {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(content: string) {
  return Math.max(1, Math.ceil(wordCount(content) / 220));
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Noch nicht";
  return new Intl.DateTimeFormat("de-DE", {dateStyle: "medium"}).format(new Date(value));
}

export function formatDateTimeInput(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export function fromDateTimeInput(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function seoIssues(post: Pick<BlogPost, "title" | "slug" | "excerpt" | "content" | "coverImage" | "coverAlt" | "seoTitle" | "seoDescription">) {
  const issues: string[] = [];

  if (!post.title.trim()) issues.push("Titel fehlt");
  if (!post.slug.trim()) issues.push("Slug fehlt");
  if (!post.excerpt.trim()) issues.push("Auszug fehlt");
  if (!post.content.trim()) issues.push("Inhalt fehlt");
  if (!post.coverImage.trim()) issues.push("Cover fehlt");
  if (!post.coverAlt.trim()) issues.push("Cover-Alt-Text fehlt");
  if (post.seoTitle.trim().length < 20 || post.seoTitle.trim().length > 65) {
    issues.push("SEO-Titel sollte 20-65 Zeichen haben");
  }
  if (post.seoDescription.trim().length < 70 || post.seoDescription.trim().length > 160) {
    issues.push("SEO-Beschreibung sollte 70-160 Zeichen haben");
  }

  return issues;
}

export function mediaUsage(posts: BlogPost[], assets: MediaAsset[]) {
  return assets.map((asset) => ({
    ...asset,
    usedByCount: posts.filter(
      (post) => post.coverImage === asset.url || post.content.includes(asset.url),
    ).length,
  }));
}

export type MediaAssetWithUsage = ReturnType<typeof mediaUsage>[number];
