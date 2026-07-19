import type {BlogPost} from "@/lib/content-store";

export const REVISION_FIELDS = ["title", "slug", "excerpt", "content", "coverImage", "coverAlt", "status", "publishedAt", "scheduledAt", "seoTitle", "seoDescription", "authorName", "category", "tags", "readingMinutes", "locale", "translationGroupId", "sourcePostId"] as const;
type RevisionField = typeof REVISION_FIELDS[number];
export type PostRevisionSnapshot = Omit<BlogPost, "translationError" | "translationStatus" | "translationUpdatedAt">;

export type PostRevision = {
  id: string;
  postId: string;
  createdAt: string;
  actor: string;
  action: "update" | "restore";
  title: string;
  slug: string;
  status: BlogPost["status"];
  snapshot: PostRevisionSnapshot;
};

export function revisionSnapshot(post: BlogPost): PostRevisionSnapshot {
  const {translationError: _translationError, translationStatus: _translationStatus, translationUpdatedAt: _translationUpdatedAt, ...snapshot} = post;
  return structuredClone(snapshot);
}

export function hasPostChanged(before: BlogPost, input: Partial<BlogPost>) {
  return REVISION_FIELDS.some((field) => field in input && input[field as RevisionField] !== before[field as RevisionField]);
}

export function changedRevisionFields(current: Partial<BlogPost>, snapshot: PostRevisionSnapshot) {
  return REVISION_FIELDS.filter((field) => current[field] !== snapshot[field]);
}
