"use client";

import {Article, CalendarBlank, CaretDown, MagnifyingGlass, WarningCircle} from "@phosphor-icons/react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useMemo, useState} from "react";
import type {BlogPost, PostStatus} from "@/lib/content-store";
import {formatDate, seoIssues, statusLabels, wordCount} from "@/lib/editor-insights";

const tabs: Array<{value: PostStatus | "all"; label: string}> = [
  {value: "all", label: "Alle"},
  {value: "draft", label: "Entwürfe"},
  {value: "review", label: "Review"},
  {value: "scheduled", label: "Geplant"},
  {value: "published", label: "Live"},
  {value: "archived", label: "Archiv"},
];

type SortKey = "newest" | "updated" | "title";

export function AdminBlogList({
  initialQuery = "",
  initialSort = "updated",
  initialStatus = "all",
  posts,
}: {
  initialQuery?: string;
  initialSort?: SortKey;
  initialStatus?: PostStatus | "all";
  posts: BlogPost[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<PostStatus | "all">(initialStatus);
  const [sort, setSort] = useState<SortKey>(initialSort);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return posts
      .filter((post) => status === "all" || post.status === status)
      .filter((post) => {
        if (!normalizedQuery) return true;
        return [post.title, post.excerpt, post.slug, post.category, post.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title, "de");
        if (sort === "newest") {
          return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [posts, query, sort, status]);

  const counts = useMemo(
    () =>
      tabs.reduce(
        (current, tab) => ({
          ...current,
          [tab.value]: tab.value === "all" ? posts.length : posts.filter((post) => post.status === tab.value).length,
        }),
        {} as Record<PostStatus | "all", number>,
      ),
    [posts],
  );

  function syncUrl(next: {query?: string; sort?: SortKey; status?: PostStatus | "all"}) {
    const nextQuery = next.query ?? query;
    const nextSort = next.sort ?? sort;
    const nextStatus = next.status ?? status;
    const params = new URLSearchParams();

    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextStatus !== "all") params.set("status", nextStatus);
    if (nextSort !== "updated") params.set("sort", nextSort);

    const target = params.toString() ? `/admin/blog?${params.toString()}` : "/admin/blog";
    router.replace(target);
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-3 rounded-[22px] border border-[#b49474]/18 bg-[#fcf3e3]/50 p-2.5 shadow-[0_14px_40px_rgba(16,15,15,0.025)] md:grid-cols-[1fr_260px]">
        <label className="relative block">
          <MagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#8b6f4e]/75" />
          <input
            className="h-14 w-full rounded-[18px] border border-[#b49474]/24 bg-[#fffaf0] pl-12 pr-4 text-base text-[#03182e] outline-none transition placeholder:text-[#6b5f50]/65 focus:border-[#8b6f4e] focus:bg-white focus:shadow-[0_0_0_4px_rgba(180,148,116,0.12)]"
            value={query}
            onBlur={() => syncUrl({query})}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") syncUrl({query});
            }}
            placeholder="Titel, Slug, Kategorie oder Tags suchen"
          />
        </label>
        <label className="relative block">
          <span className="sr-only">Sortierung</span>
          <select
            className="h-14 w-full appearance-none rounded-[18px] border border-[#b49474]/24 bg-[#fffaf0] px-4 pr-11 text-base font-medium text-[#03182e] outline-none transition focus:border-[#8b6f4e] focus:bg-white focus:shadow-[0_0_0_4px_rgba(180,148,116,0.12)]"
            value={sort}
            onChange={(event) => {
              const nextSort = event.target.value as SortKey;
              setSort(nextSort);
              syncUrl({sort: nextSort});
            }}
          >
            <option value="updated">Zuletzt bearbeitet</option>
            <option value="newest">Neueste Veröffentlichung</option>
            <option value="title">Titel A-Z</option>
          </select>
          <CaretDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#8b6f4e]" />
        </label>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-[#b49474]/20 pb-5">
        {tabs.map((tab) => (
          <button
            className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition active:-translate-y-px ${
              status === tab.value
                ? "border-[#03182e] bg-[#03182e] text-[#f9f4e7]"
                : "border-[#b49474]/22 bg-[#fcf3e3]/45 text-[#4c4235] hover:bg-[#f2e2ce]"
            }`}
            key={tab.value}
            onClick={() => {
              setStatus(tab.value);
              syncUrl({status: tab.value});
            }}
            type="button"
          >
            {tab.label} <span className="ml-1 text-current opacity-55">{counts[tab.value]}</span>
          </button>
        ))}
      </div>

      {filtered.length ? (
        <div className="overflow-hidden rounded-[24px] border border-[#b49474]/20 bg-[#fcf3e3]/26">
          {filtered.map((post) => {
            const issues = seoIssues(post);
            return (
              <Link
                className="grid gap-4 border-b border-[#b49474]/16 px-4 py-4 transition last:border-b-0 hover:bg-[#fffaf0] md:grid-cols-[116px_minmax(0,1fr)_210px] md:items-center"
                href={`/admin/blog/${post.id}`}
                key={post.id}
              >
                <MediaThumb post={post} />
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={post.status} />
                    {post.category ? (
                      <span className="rounded-full bg-[#f2e2ce] px-2.5 py-1 text-xs font-medium text-[#4c4235]">
                        {post.category}
                      </span>
                    ) : null}
                    {issues.length ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#7f1d1d]/10 px-2.5 py-1 text-xs font-medium text-[#7f1d1d]">
                        <WarningCircle className="size-3.5" />
                        {issues.length} Hinweise
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-base font-semibold tracking-tight text-[#03182e]">{post.title}</p>
                  <p className="mt-1.5 line-clamp-2 max-w-3xl text-sm leading-6 text-[#6b5f50]">
                    {post.excerpt || "Kein Auszug gepflegt."}
                  </p>
                  <p className="mt-1.5 truncate text-xs font-medium text-[#8b6f4e]">/blog/{post.slug}</p>
                </div>
                <div className="grid gap-2 text-sm text-[#4c4235] md:justify-items-end md:text-right">
                  <span className="inline-flex items-center gap-2">
                    <CalendarBlank className="size-4 text-[#8b6f4e]" />
                    Bearbeitet {formatDate(post.updatedAt)}
                  </span>
                  <span className="text-[#6b5f50]">{wordCount(post.content)} Wörter</span>
                  <span className="text-[#6b5f50]">{post.readingMinutes} Min. Lesezeit</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[#b49474]/35 bg-[#fcf3e3]/45 px-6 py-14 text-center">
          <Article className="mx-auto mb-4 size-10 text-[#8b6f4e]" />
          <p className="text-lg font-semibold">Keine passenden Beiträge</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6b5f50]">
            Passe Suche oder Statusfilter an, um vorhandene Beiträge wieder einzublenden.
          </p>
        </div>
      )}
    </section>
  );
}

function MediaThumb({post}: {post: BlogPost}) {
  if (isVideoUrl(post.coverImage)) {
    return <video className="aspect-[4/3] w-full rounded-[18px] object-cover" muted preload="metadata" src={post.coverImage} />;
  }

  return <img alt={post.coverAlt || post.title} className="aspect-[4/3] w-full rounded-[18px] object-cover" src={post.coverImage} />;
}

export function StatusBadge({status}: {status: PostStatus}) {
  const styles: Record<PostStatus, string> = {
    archived: "border-[#6b5f50]/25 bg-[#6b5f50]/8 text-[#4c4235]",
    draft: "border-[#b49474]/30 bg-[#fcf3e3] text-[#4c4235]",
    published: "border-[#0f5132]/20 bg-[#0f5132]/10 text-[#0f5132]",
    review: "border-[#8b6f4e]/24 bg-[#b49474]/10 text-[#4c4235]",
    scheduled: "border-[#0f4c81]/20 bg-[#0f4c81]/10 text-[#0f4c81]",
  };

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${styles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm)(\?|#|$)/i.test(url);
}
