import {AdminPageHeader} from "@/components/admin-shell";
import {AdminScreen} from "@/components/admin-screen";
import {SiteContentForm} from "@/components/site-content-form";
import {getSiteContent} from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function AdminWebsitePage() {
  return (
    <AdminScreen>
      <AdminPageHeader eyebrow="Website" title="Texte und SEO pflegen" />
      <SiteContentForm content={await getSiteContent()} />
    </AdminScreen>
  );
}
