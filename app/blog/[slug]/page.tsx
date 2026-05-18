import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {BlogContentRenderer} from "@/components/blog-content-renderer";
import {getPostBySlug} from "@/lib/content-store";

type PageProps = {
  params: Promise<{slug: string}>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {slug} = await params;
  const post = await getPostBySlug(slug);

  if (!post) return {};

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: [post.coverImage],
      type: "article",
    },
  };
}

export default async function BlogPostPage({params}: PageProps) {
  const {slug} = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <main className="min-h-[100dvh] bg-[#f9f4e7] text-[#03182e]">
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-24 md:pt-32">
        {/* Back Navigation */}
        <Link
          className="inline-flex items-center gap-3 text-sm font-medium text-[#6b5f50] transition hover:text-[#03182e]"
          href="/blog"
        >
          <img alt="" className="h-10 w-10 rounded-full object-contain" src="/media/images/msyh-logo.webp" />
          <span>Zurück zu den Insights</span>
        </Link>

        {/* Post Header */}
        <header className="mt-12 border-b border-[#b49474]/25 pb-10">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            {post.category && (
              <span className="rounded-full bg-[#f2e2ce] px-3 py-1 text-xs font-medium tracking-wide text-[#4c4235]">
                {post.category}
              </span>
            )}
            <p className="text-xs uppercase tracking-[0.2em] text-[#b49474]">
              {post.publishedAt
                ? new Intl.DateTimeFormat("de-DE", {dateStyle: "long"}).format(new Date(post.publishedAt))
                : "Insight"}
              {post.readingMinutes ? ` · ${post.readingMinutes} Min. Lesezeit` : ""}
            </p>
          </div>
          <h1 className="font-serif text-5xl leading-[0.98] md:text-7xl">{post.title}</h1>
          {post.excerpt && (
            <p className="mt-8 max-w-3xl text-xl leading-9 text-[#4c4235]">{post.excerpt}</p>
          )}
        </header>

        {/* Cover Media */}
        {isVideoUrl(post.coverImage) ? (
          <video
            className="mt-12 aspect-[16/9] w-full rounded-[28px] object-cover shadow-[0_32px_80px_rgba(16,15,15,0.14)]"
            controls
            playsInline
            src={post.coverImage}
          />
        ) : (
          <img
            alt={post.coverAlt || post.title}
            className="mt-12 aspect-[16/9] w-full rounded-[28px] object-cover shadow-[0_32px_80px_rgba(16,15,15,0.14)]"
            src={post.coverImage}
          />
        )}

        {/* Tags */}
        {post.tags ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
              .map((tag) => (
                <span
                  className="rounded-full border border-[#b49474]/30 px-3 py-1 text-xs text-[#6b5f50]"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
          </div>
        ) : null}

        {/* Content */}
        <BlogContentRenderer className="prose-brand mt-14" content={post.content} />
      </article>

      {/* Footer CTA */}
      <section className="border-t border-[#b49474]/20 bg-[#fcf3e3] px-6 py-16 text-center">
        <p className="mb-3 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b49474]">
          Weitere Impulse
        </p>
        <h2 className="font-serif text-3xl font-normal text-[#03182e] md:text-4xl">
          Mehr ruhige Gedanken entdecken.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            className="rounded-full border border-[#03182e] bg-[#03182e] px-6 py-3 text-sm font-medium text-[#f9f4e7] transition duration-300 hover:border-[#d4af37] hover:bg-[#100f0f] active:-translate-y-px"
            href="/blog"
          >
            Alle Insights
          </Link>
          <Link
            className="rounded-full border border-[#03182e]/20 px-6 py-3 text-sm font-medium text-[#03182e] transition duration-300 hover:border-[#d4af37] active:-translate-y-px"
            href="/"
          >
            Zur Website
          </Link>
        </div>
      </section>
    </main>
  );
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm)(\?|#|$)/i.test(url);
}
