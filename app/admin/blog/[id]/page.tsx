import {notFound} from "next/navigation";
import {AdminPageHeader} from "@/components/admin-shell";
import {AdminScreen} from "@/components/admin-screen";
import {BlogPostForm} from "@/components/blog-post-form";
import {getPostById, getTranslationCounterpart, listMediaAssets} from "@/lib/content-store";

type PageProps = {
  params: Promise<{id: string}>;
  searchParams: Promise<{translation?: string}>;
};

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({params, searchParams}: PageProps) {
  const {id} = await params;
  const query = await searchParams;
  const [post, mediaAssets, counterpart] = await Promise.all([
    getPostById(id),
    listMediaAssets(),
    getTranslationCounterpart(id),
  ]);

  if (!post) notFound();

  return (
    <AdminScreen>
      <AdminPageHeader eyebrow="Insight bearbeiten" title={post.title} />
      <BlogPostForm
        counterpart={counterpart}
        mediaAssets={mediaAssets}
        post={post}
        translationCreated={query.translation === "draft"}
      />
    </AdminScreen>
  );
}
