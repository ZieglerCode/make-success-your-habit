import Link from "next/link";
import {AdminMetric, AdminPageHeader} from "@/components/admin-shell";
import {AdminScreen} from "@/components/admin-screen";
import {listMediaAssets, listPosts} from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const posts = await listPosts({includeArchived: true});
  const media = await listMediaAssets();
  const published = posts.filter((post) => post.status === "published");
  const drafts = posts.filter((post) => post.status === "draft");
  const recent = posts.slice(0, 5);

  return (
    <AdminScreen>
      <AdminPageHeader eyebrow="Studio Übersicht" title="Was heute gepflegt werden sollte">
        <Link
          className="inline-flex rounded-full bg-[#03182e] px-5 py-3 text-sm font-medium text-[#f9f4e7] transition hover:bg-[#100f0f] active:-translate-y-px"
          href="/admin/blog/new"
        >
          Neuer Blogpost
        </Link>
      </AdminPageHeader>

      <section className="grid gap-6 md:grid-cols-3">
        <AdminMetric detail="öffentlich sichtbar im Blog" label="Veröffentlicht" value={published.length} />
        <AdminMetric detail="bereit für nächste Überarbeitung" label="Entwürfe" value={drafts.length} />
        <AdminMetric detail="Bilder und Uploads im Studio" label="Medien" value={media.length} />
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-3xl">Letzte Beiträge</h2>
          <Link className="text-sm text-[#6b5f50] hover:text-[#03182e]" href="/admin/blog">
            Alle anzeigen
          </Link>
        </div>
        <div className="divide-y divide-[#b49474]/20 border-y border-[#b49474]/20">
          {recent.length ? (
            recent.map((post) => (
              <Link
                className="grid gap-3 py-5 transition hover:bg-[#fcf3e3]/70 md:grid-cols-[1fr_auto]"
                href={`/admin/blog/${post.id}`}
                key={post.id}
              >
                <div>
                  <p className="font-medium">{post.title}</p>
                  <p className="mt-1 text-sm text-[#6b5f50]">{post.excerpt || "Kein Auszug gepflegt."}</p>
                </div>
                <span className="h-fit rounded-full border border-[#b49474]/30 px-3 py-1 text-xs uppercase tracking-[0.14em] text-[#4c4235]">
                  {post.status}
                </span>
              </Link>
            ))
          ) : (
            <p className="py-8 text-[#6b5f50]">Noch keine Beiträge vorhanden.</p>
          )}
        </div>
      </section>
    </AdminScreen>
  );
}
