import Link from "next/link";
import SiteHome from "@/components/site-home";
import {getSiteContent, listPosts} from "@/lib/content-store";

export const dynamic = "force-dynamic";

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm)(\?|#|$)/i.test(url);
}

export default async function HomePage() {
  const content = await getSiteContent();
  const posts = await listPosts({publishedOnly: true});
  const recentPosts = posts.slice(0, 3);
  const [featuredPost, ...secondaryPosts] = recentPosts;

  return (
    <>
      <SiteHome />

      {/* Editorial Insights Preview */}
      <section className="bg-[#f9f4e7] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-14 flex items-end justify-between border-b border-[#b49474]/30 pb-8">
            <div>
              <p className="mb-3 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b49474]">
                Insights
              </p>
              <h2 className="font-serif text-4xl font-normal leading-tight text-[#03182e] md:text-5xl">
                {content.ctaHeadline}
              </h2>
            </div>
            <Link
              className="hidden shrink-0 items-center gap-2 text-sm font-medium text-[#6b5f50] transition hover:text-[#03182e] md:inline-flex"
              href="/blog"
            >
              Alle Insights
              <span className="ml-1 text-[#d4af37]">→</span>
            </Link>
          </div>

          {recentPosts.length > 0 ? (
            <>
              {/* Featured Post */}
              {featuredPost && (
                <Link
                  className="group mb-14 block md:grid md:grid-cols-[1.05fr_0.95fr] md:gap-14"
                  href={`/blog/${featuredPost.slug}`}
                >
                  <div className="overflow-hidden rounded-[28px] border border-[#b49474]/15 bg-[#fcf3e3]">
                    {isVideoUrl(featuredPost.coverImage) ? (
                      <video
                        className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                        muted
                        playsInline
                        preload="metadata"
                        src={featuredPost.coverImage}
                      />
                    ) : (
                      <img
                        alt={featuredPost.coverAlt || featuredPost.title}
                        className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                        src={featuredPost.coverImage}
                      />
                    )}
                  </div>
                  <div className="flex flex-col justify-center pt-8 md:pt-0">
                    <p className="mb-5 text-xs uppercase tracking-[0.18em] text-[#b49474]">
                      {featuredPost.publishedAt
                        ? new Intl.DateTimeFormat("de-DE", {dateStyle: "long"}).format(
                            new Date(featuredPost.publishedAt),
                          )
                        : "Insight"}
                      {featuredPost.readingMinutes ? ` · ${featuredPost.readingMinutes} Min. Lesezeit` : ""}
                    </p>
                    <h3 className="font-serif text-3xl font-normal leading-tight text-[#03182e] md:text-[2.5rem]">
                      {featuredPost.title}
                    </h3>
                    {featuredPost.excerpt && (
                      <p className="mt-5 line-clamp-4 text-base leading-8 text-[#4c4235]">
                        {featuredPost.excerpt}
                      </p>
                    )}
                    <span className="mt-8 inline-flex w-fit items-center gap-2 border-b border-[#03182e]/20 pb-0.5 text-sm font-medium text-[#03182e] transition duration-300 group-hover:border-[#d4af37] group-hover:text-[#6b5f50]">
                      Lesen
                      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              )}

              {/* Secondary Posts */}
              {secondaryPosts.length > 0 && (
                <div className="grid gap-10 border-t border-[#b49474]/20 pt-12 md:grid-cols-2">
                  {secondaryPosts.map((post) => (
                    <Link className="group block" href={`/blog/${post.slug}`} key={post.id}>
                      <div className="overflow-hidden rounded-[20px] border border-[#b49474]/15 bg-[#fcf3e3]">
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
                            alt={post.coverAlt || post.title}
                            className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                            src={post.coverImage}
                          />
                        )}
                      </div>
                      <div className="pt-5">
                        <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[#b49474]">
                          {post.publishedAt
                            ? new Intl.DateTimeFormat("de-DE", {dateStyle: "long"}).format(
                                new Date(post.publishedAt),
                              )
                            : "Insight"}
                          {post.readingMinutes ? ` · ${post.readingMinutes} Min.` : ""}
                        </p>
                        <h3 className="font-serif text-2xl font-normal leading-snug text-[#03182e] transition duration-300 group-hover:text-[#6b5f50] md:text-3xl">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#4c4235]">
                            {post.excerpt}
                          </p>
                        )}
                        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#6b5f50] transition duration-300 group-hover:text-[#03182e]">
                          Lesen{" "}
                          <span className="text-[#d4af37] transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Mobile CTA */}
              <div className="mt-12 text-center md:hidden">
                <Link
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#6b5f50] transition hover:text-[#03182e]"
                  href="/blog"
                >
                  Alle Insights lesen <span className="text-[#d4af37]">→</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <p className="text-base leading-8 text-[#4c4235]">{content.ctaText}</p>
              <Link
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#03182e] bg-[#03182e] px-6 py-3 text-sm font-medium tracking-wide text-[#f9f4e7] transition duration-300 hover:border-[#d4af37] hover:bg-[#100f0f]"
                href="/blog"
              >
                Insights entdecken
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
