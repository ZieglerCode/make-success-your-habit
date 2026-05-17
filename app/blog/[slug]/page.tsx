import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
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
      <article className="mx-auto max-w-4xl px-6 pb-24 pt-24 md:pt-32">
        <Link className="text-sm text-[#6b5f50] transition hover:text-[#03182e]" href="/blog">
          Zurück zu den Insights
        </Link>
        <p className="mt-12 text-xs uppercase tracking-[0.2em] text-[#b49474]">
          {post.publishedAt
            ? new Intl.DateTimeFormat("de-DE", {dateStyle: "long"}).format(new Date(post.publishedAt))
            : "Insight"}
        </p>
        <h1 className="mt-5 font-serif text-5xl leading-[0.98] md:text-7xl">{post.title}</h1>
        <p className="mt-8 max-w-3xl text-xl leading-9 text-[#4c4235]">{post.excerpt}</p>
        {isVideoUrl(post.coverImage) ? (
          <video
            className="mt-12 aspect-[16/9] w-full rounded-[28px] object-cover shadow-[0_32px_80px_rgba(16,15,15,0.14)]"
            controls
            playsInline
            src={post.coverImage}
          />
        ) : (
          <img
            alt={post.title}
            className="mt-12 aspect-[16/9] w-full rounded-[28px] object-cover shadow-[0_32px_80px_rgba(16,15,15,0.14)]"
            src={post.coverImage}
          />
        )}
        <div className="prose-brand mt-14">
          {post.content.split(/\n{2,}/).map((block) => (
            <ContentBlock block={block} key={block} />
          ))}
        </div>
      </article>
    </main>
  );
}

function ContentBlock({block}: {block: string}) {
  const trimmed = block.trim();
  const imageMatch = trimmed.match(/^!\[(.*)]\((.+)\)$/);
  const videoMatch = trimmed.match(/^\[video]\((.+)\)$/i);

  if (imageMatch) {
    return (
      <img
        alt={imageMatch[1] || ""}
        className="my-10 aspect-[16/10] w-full rounded-[24px] object-cover"
        src={imageMatch[2]}
      />
    );
  }

  if (videoMatch) {
    return (
      <video
        className="my-10 aspect-video w-full rounded-[24px] object-cover"
        controls
        playsInline
        src={videoMatch[1]}
      />
    );
  }

  return <p>{trimmed}</p>;
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm)(\?|#|$)/i.test(url);
}
