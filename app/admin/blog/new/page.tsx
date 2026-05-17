import {AdminPageHeader} from "@/components/admin-shell";
import {AdminScreen} from "@/components/admin-screen";
import {BlogPostForm} from "@/components/blog-post-form";

export default function NewBlogPostPage() {
  return (
    <AdminScreen>
      <AdminPageHeader eyebrow="Neuer Insight" title="Blogpost erstellen" />
      <BlogPostForm />
    </AdminScreen>
  );
}
