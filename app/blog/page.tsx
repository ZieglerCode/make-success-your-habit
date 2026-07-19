import type {Metadata} from "next";
import Link from "next/link";
import {CroppedCoverImage} from "@/components/cropped-cover-image";
import {LanguageSwitcher} from "@/components/language-switcher";
import {listPosts} from "@/lib/content-store";

export const metadata: Metadata = {
  title: "Insights | Make Success Your Habit",
  description: "Essays and impulses from Heike Ziegler on success, identity, and self-leadership.",
};

export const dynamic = "force-dynamic";

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm)(\?|#|$)/i.test(url);
}

export default async function BlogIndexPage() {
  const posts = await listPosts({publishedOnly: true});

  return (
    <main className="min-h-[100dvh] bg-[#f9f4e7] text-[#03182e]">
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-28 md:pb-32 md:pt-36">
        {/* Page Header */}
        <div className="mb-16 grid gap-10 border-b border-[#b49474]/30 pb-14 md:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-wrap items-center justify-between gap-4 md:block">
            <Link
              className="inline-flex items-center gap-3 text-sm font-medium text-[#6b5f50] transition hover:text-[#03182e]"
              href="/"
            >
              <img alt="" className="h-10 w-10 rounded-full object-contain" src="/media/images/msyh-logo.webp" />
              <span>Back to the website</span>
            </Link>
            <LanguageSwitcher className="md:mt-6" tone="legal" />
          </div>
          <div>
            <p className="mb-5 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b49474]">
              Insights
            </p>
            <h1 className="font-serif text-5xl leading-none md:text-7xl">
              Quiet impulses for inner success.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#4c4235]">
              Essays on identity, clarity, and the kind of growth that comes from self-leadership,
              not pressure.
            </p>
          </div>
        </div>

        {posts.length ? (
          <div className="space-y-16">
            {/* Featured First Post */}
            <article className="group md:grid md:grid-cols-[1fr_1.1fr] md:gap-12">
              <Link
                className="block overflow-hidden rounded-[28px] border border-[#b49474]/15 bg-[#fcf3e3]"
                href={`/blog/${posts[0].slug}`}
              >
                {isVideoUrl(posts[0].coverImage) ? (
                  <video
                    className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    muted
                    playsInline
                    preload="metadata"
                    src={posts[0].coverImage}
                  />
                ) : (
                  <CroppedCoverImage
                    alt={posts[0].coverAlt || posts[0].title}
                    className="aspect-[16/10] w-full transition duration-700 group-hover:scale-[1.03]"
                    crops={posts[0].coverCrops}
                    preset="card"
                    src={posts[0].coverImage}
                  />
                )}
              </Link>
              <div className="flex flex-col justify-center pt-8 md:pt-0">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  {posts[0].category && (
                    <span className="rounded-full bg-[#f2e2ce] px-3 py-1 text-xs font-medium tracking-wide text-[#4c4235]">
                      {posts[0].category}
                    </span>
                  )}
                  <span className="text-xs uppercase tracking-[0.18em] text-[#b49474]">
                    {posts[0].publishedAt
                      ? new Intl.DateTimeFormat("en-US", {dateStyle: "long"}).format(
                          new Date(posts[0].publishedAt),
                        )
                      : "Insight"}
                    {posts[0].readingMinutes ? ` · ${posts[0].readingMinutes} min read` : ""}
                  </span>
                </div>
                <h2 className="font-serif text-4xl font-normal leading-tight text-[#03182e] md:text-5xl">
                  <Link className="transition hover:text-[#6b5f50]" href={`/blog/${posts[0].slug}`}>
                    {posts[0].title}
                  </Link>
                </h2>
                {posts[0].excerpt && (
                  <p className="mt-5 max-w-2xl text-base leading-8 text-[#4c4235]">
                    {posts[0].excerpt}
                  </p>
                )}
                <Link
                  className="mt-8 inline-flex w-fit items-center gap-2 border-b border-[#03182e]/20 pb-0.5 text-sm font-medium text-[#03182e] transition duration-300 hover:border-[#d4af37] hover:text-[#6b5f50]"
                  href={`/blog/${posts[0].slug}`}
                >
                  Read now{" "}
                  <span className="text-[#d4af37] transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </article>

            {/* Remaining Posts Grid */}
            {posts.length > 1 && (
              <div className="grid gap-10 border-t border-[#b49474]/20 pt-14 md:grid-cols-2">
                {posts.slice(1).map((post) => (
                  <article className="group" key={post.id}>
                    <Link
                      className="block overflow-hidden rounded-[24px] border border-[#b49474]/15 bg-[#fcf3e3]"
                      href={`/blog/${post.slug}`}
                    >
                      {isVideoUrl(post.coverImage) ? (
                        <video
                          className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                          muted
                          playsInline
                          preload="metadata"
                          src={post.coverImage}
                        />
                      ) : (
                        <CroppedCoverImage
                          alt={post.coverAlt || post.title}
                          className="aspect-[16/10] w-full transition duration-700 group-hover:scale-[1.03]"
                          crops={post.coverCrops}
                          preset="card"
                          src={post.coverImage}
                        />
                      )}
                    </Link>
                    <div className="pt-6">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        {post.category && (
                          <span className="rounded-full bg-[#f2e2ce] px-3 py-1 text-xs font-medium tracking-wide text-[#4c4235]">
                            {post.category}
                          </span>
                        )}
                        <span className="text-xs uppercase tracking-[0.16em] text-[#b49474]">
                          {post.publishedAt
                            ? new Intl.DateTimeFormat("en-US", {dateStyle: "long"}).format(
                                new Date(post.publishedAt),
                              )
                            : "Insight"}
                          {post.readingMinutes ? ` · ${post.readingMinutes} min read` : ""}
                        </span>
                      </div>
                      <h2 className="font-serif text-2xl font-normal leading-snug text-[#03182e] md:text-3xl">
                        <Link
                          className="transition duration-300 group-hover:text-[#6b5f50]"
                          href={`/blog/${post.slug}`}
                        >
                          {post.title}
                        </Link>
                      </h2>
                      {post.excerpt && (
                        <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#4c4235]">
                          {post.excerpt}
                        </p>
                      )}
                      <Link
                        className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#6b5f50] transition duration-300 hover:text-[#03182e]"
                        href={`/blog/${post.slug}`}
                      >
                        Read{" "}
                        <span className="text-[#d4af37] transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-16">
            <p className="max-w-xl text-lg leading-8 text-[#4c4235]">
              No published insights are available yet.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
