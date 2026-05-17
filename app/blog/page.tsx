import type {Metadata} from "next";
import Link from "next/link";
import {listPosts} from "@/lib/content-store";

export const metadata: Metadata = {
  title: "Insights | Make Success Your Habit",
  description: "Essays und Impulse von Heike Ziegler über Erfolg, Identität und Selbstführung.",
};

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  const posts = await listPosts({publishedOnly: true});

  return (
    <main className="min-h-[100dvh] bg-[#f9f4e7] text-[#03182e]">
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-28 md:pb-24 md:pt-36">
        <div className="grid gap-10 border-b border-[#b49474]/30 pb-14 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Link className="text-sm text-[#6b5f50] transition hover:text-[#03182e]" href="/">
              Zurück zur Website
            </Link>
          </div>
          <div>
            <p className="mb-5 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b49474]">
              Insights
            </p>
            <h1 className="font-serif text-5xl leading-none md:text-7xl">
              Ruhige Impulse für inneren Erfolg.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#4c4235]">
              Essays über Identität, Klarheit und die Art von Wachstum, die nicht aus Druck,
              sondern aus Selbstführung entsteht.
            </p>
          </div>
        </div>

        {posts.length ? (
          <div className="grid gap-8 pt-14 md:grid-cols-2">
            {posts.map((post, index) => (
              <article
                className={index === 0 ? "md:col-span-2 md:grid md:grid-cols-[1fr_1.1fr] md:gap-10" : ""}
                key={post.id}
              >
                <Link className="group block" href={`/blog/${post.slug}`}>
                  <div className="overflow-hidden rounded-[28px] border border-[#b49474]/20 bg-[#fcf3e3]">
                    {isVideoUrl(post.coverImage) ? (
                      <video
                        className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                        muted
                        playsInline
                        preload="metadata"
                        src={post.coverImage}
                      />
                    ) : (
                      <img
                        alt={post.title}
                        className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                        src={post.coverImage}
                      />
                    )}
                  </div>
                </Link>
                <div className="pt-6">
                  <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[#6b5f50]">
                    {post.publishedAt
                      ? new Intl.DateTimeFormat("de-DE", {dateStyle: "long"}).format(
                          new Date(post.publishedAt),
                        )
                      : "Insight"}
                  </p>
                  <h2 className="font-serif text-3xl leading-tight md:text-5xl">
                    <Link className="transition hover:text-[#b49474]" href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-[#4c4235]">{post.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="pt-16">
            <p className="max-w-xl text-lg leading-8 text-[#4c4235]">
              Es sind noch keine veröffentlichten Insights vorhanden.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm)(\?|#|$)/i.test(url);
}
