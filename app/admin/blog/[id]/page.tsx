import {notFound} from "next/navigation";
import {AdminPageHeader} from "@/components/admin-shell";
import {AdminScreen} from "@/components/admin-screen";
import {BlogPostForm} from "@/components/blog-post-form";
import {getPostById} from "@/lib/content-store";

type PageProps = {
  params: Promise<{id: string}>;
};

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({params}: PageProps) {
  const {id} = await params;
  const post = await getPostById(id);

  if (!post) notFound();

  return (
    <AdminScreen>
      <AdminPageHeader eyebrow="Insight bearbeiten" title={post.title} />
      <BlogPostForm post={post} />
    </AdminScreen>
  );
}
