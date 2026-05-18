import Link from "next/link";
import {AdminPageHeader} from "@/components/admin-shell";
import {AdminBlogList} from "@/components/admin-blog-list";
import {AdminScreen} from "@/components/admin-screen";
import {listPosts, type PostStatus} from "@/lib/content-store";

export const dynamic = "force-dynamic";

const postStatuses = new Set(["draft", "review", "scheduled", "published", "archived", "all"]);

type PageProps = {
  searchParams: Promise<{q?: string; status?: string; sort?: string}>;
};

export default async function AdminBlogPage({searchParams}: PageProps) {
  const params = await searchParams;
  const status = postStatuses.has(params.status || "") ? params.status : "all";
  const sort = params.sort === "newest" || params.sort === "oldest" || params.sort === "title" || params.sort === "updated"
    ? params.sort
    : "updated";
  const posts = await listPosts({
    includeArchived: true,
    q: params.q,
    sort,
    status: status as PostStatus | "all",
  });

  return (
    <AdminScreen>
      <AdminPageHeader eyebrow="Redaktion" title="Blogposts">
        <Link
          className="inline-flex rounded-full bg-[#03182e] px-5 py-3 text-sm font-medium text-[#f9f4e7] transition hover:bg-[#100f0f] active:-translate-y-px"
          href="/admin/blog/new"
        >
          Neuer Beitrag
        </Link>
      </AdminPageHeader>
      <AdminBlogList initialQuery={params.q || ""} initialSort={sort === "oldest" ? "updated" : sort} initialStatus={status as PostStatus | "all"} posts={posts} />
    </AdminScreen>
  );
}
