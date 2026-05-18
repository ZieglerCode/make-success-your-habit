import Link from "next/link";
import {AdminMetric, AdminPageHeader} from "@/components/admin-shell";
import {AdminScreen} from "@/components/admin-screen";
import {listMediaAssets, listPosts} from "@/lib/content-store";
import {formatDate, mediaUsage, seoIssues, statusLabels} from "@/lib/editor-insights";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const posts = await listPosts({includeArchived: true});
  const media = await listMediaAssets();
  const published = posts.filter((post) => post.status === "published");
  const drafts = posts.filter((post) => post.status === "draft");
  const review = posts.filter((post) => post.status === "review");
  const scheduled = posts.filter((post) => post.status === "scheduled");
  const recent = [...posts].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  const postsWithSeoIssues = posts.filter((post) => post.status !== "archived" && seoIssues(post).length);
  const mediaWithUsage = mediaUsage(posts, media);
  const mediaWithoutAlt = mediaWithUsage.filter((asset) => !asset.alt.trim());
  const unusedMedia = mediaWithUsage.filter((asset) => asset.usedByCount === 0);

  return (
    <AdminScreen>
      <AdminPageHeader eyebrow="Studio Übersicht" title="Redaktion heute">
        <div className="flex flex-wrap gap-2">
          <Link
            className="inline-flex rounded-full border border-[#b49474]/30 px-5 py-3 text-sm font-medium text-[#4c4235] transition hover:bg-[#f2e2ce] active:-translate-y-px"
            href="/admin/media"
          >
            Medien prüfen
          </Link>
          <Link
            className="inline-flex rounded-full bg-[#03182e] px-5 py-3 text-sm font-medium text-[#f9f4e7] transition hover:bg-[#100f0f] active:-translate-y-px"
            href="/admin/blog/new"
          >
            Neuer Blogpost
          </Link>
        </div>
      </AdminPageHeader>

      <section className="grid gap-6 md:grid-cols-4">
        <AdminMetric detail="öffentlich sichtbar im Blog" label="Veröffentlicht" value={published.length} />
        <AdminMetric detail="bereit für nächste Überarbeitung" label="Entwürfe" value={drafts.length} />
        <AdminMetric detail="warten auf finale Freigabe" label="Review" value={review.length} />
        <AdminMetric detail="für später vorbereitet" label="Geplant" value={scheduled.length} />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-[#b49474]/20 bg-[#fcf3e3]/55 p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b6f4e]">Arbeitsliste</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Zuletzt bearbeitet</h2>
            </div>
            <Link className="text-sm font-medium text-[#6b5f50] hover:text-[#03182e]" href="/admin/blog">
              Alle anzeigen
            </Link>
          </div>
          <div className="divide-y divide-[#b49474]/20 border-y border-[#b49474]/20">
            {recent.length ? (
              recent.map((post) => (
                <Link
                  className="grid gap-3 py-4 transition hover:bg-[#f9f4e7]/65 md:grid-cols-[1fr_auto]"
                  href={`/admin/blog/${post.id}`}
                  key={post.id}
                >
                  <div>
                    <p className="font-semibold tracking-tight">{post.title}</p>
                    <p className="mt-1 text-sm text-[#6b5f50]">
                      {statusLabels[post.status]} · bearbeitet {formatDate(post.updatedAt)}
                    </p>
                  </div>
                  <span className="h-fit rounded-full border border-[#b49474]/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#4c4235]">
                    {post.status}
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-8 text-[#6b5f50]">Noch keine Beiträge vorhanden.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <EditorialAlert
            action="Beiträge prüfen"
            count={postsWithSeoIssues.length}
            detail="Beiträge mit fehlenden Pflichtdaten, schwacher SEO-Länge oder fehlendem Cover-Alt-Text."
            href="/admin/blog"
            title="SEO- und Publish-Hinweise"
          />
          <EditorialAlert
            action="Alt-Texte pflegen"
            count={mediaWithoutAlt.length}
            detail="Medien ohne Beschreibung sind für Barrierefreiheit und Wiederfinden problematisch."
            href="/admin/media"
            title="Medien ohne Alt-Text"
          />
          <EditorialAlert
            action="Bibliothek öffnen"
            count={unusedMedia.length}
            detail={`${media.length} Dateien insgesamt, davon aktuell ohne sichtbare Verwendung.`}
            href="/admin/media"
            title="Ungenutzte Medien"
          />
        </div>
      </section>
    </AdminScreen>
  );
}

function EditorialAlert({
  action,
  count,
  detail,
  href,
  title,
}: {
  action: string;
  count: number;
  detail: string;
  href: string;
  title: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#b49474]/20 bg-[#fcf3e3]/55 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#03182e]">{title}</p>
          <p className="mt-2 text-sm leading-6 text-[#6b5f50]">{detail}</p>
        </div>
        <span className="rounded-full bg-[#03182e] px-3 py-1 text-sm font-semibold text-[#f9f4e7]">{count}</span>
      </div>
      <Link className="mt-4 inline-flex text-sm font-semibold text-[#03182e] hover:text-[#8b6f4e]" href={href}>
        {action}
      </Link>
    </div>
  );
}
