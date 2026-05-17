import Link from "next/link";
import {AdminPageHeader} from "@/components/admin-shell";
import {AdminScreen} from "@/components/admin-screen";
import {listPosts} from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await listPosts({includeArchived: true});

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
      <div className="divide-y divide-[#b49474]/20 border-y border-[#b49474]/20">
        {posts.length ? (
          posts.map((post) => (
            <Link
              className="grid gap-4 py-5 transition hover:bg-[#fcf3e3]/70 md:grid-cols-[120px_1fr_auto]"
              href={`/admin/blog/${post.id}`}
              key={post.id}
            >
              <img
                alt=""
                className="aspect-[4/3] w-full rounded-xl object-cover"
                src={post.coverImage}
              />
              <div>
                <p className="font-medium">{post.title}</p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b5f50]">
                  {post.excerpt || "Kein Auszug gepflegt."}
                </p>
                <p className="mt-2 text-xs text-[#6b5f50]">/{post.slug}</p>
              </div>
              <span className="h-fit rounded-full border border-[#b49474]/30 px-3 py-1 text-xs uppercase tracking-[0.14em] text-[#4c4235]">
                {post.status}
              </span>
            </Link>
          ))
        ) : (
          <div className="py-12">
            <p className="text-[#6b5f50]">Noch keine Blogposts vorhanden.</p>
          </div>
        )}
      </div>
    </AdminScreen>
  );
}
