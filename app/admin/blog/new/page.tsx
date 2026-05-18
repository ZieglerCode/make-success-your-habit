import {AdminPageHeader} from "@/components/admin-shell";
import {AdminScreen} from "@/components/admin-screen";
import {BlogPostForm} from "@/components/blog-post-form";
import {listMediaAssets} from "@/lib/content-store";

type PageProps = {
  searchParams: Promise<{cover?: string; coverAlt?: string}>;
};

export default async function NewBlogPostPage({searchParams}: PageProps) {
  const params = await searchParams;
  const mediaAssets = await listMediaAssets();

  return (
    <AdminScreen>
      <AdminPageHeader eyebrow="Neuer Insight" title="Blogpost erstellen" />
      <BlogPostForm initialCover={params.cover} initialCoverAlt={params.coverAlt} mediaAssets={mediaAssets} />
    </AdminScreen>
  );
}
