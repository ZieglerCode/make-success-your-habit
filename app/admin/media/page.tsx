import {AdminPageHeader} from "@/components/admin-shell";
import {AdminScreen} from "@/components/admin-screen";
import {MediaManager} from "@/components/media-manager";
import {listMediaAssets, listPosts} from "@/lib/content-store";
import {mediaUsage} from "@/lib/editor-insights";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const [assets, posts] = await Promise.all([listMediaAssets(), listPosts({includeArchived: true})]);

  return (
    <AdminScreen>
      <AdminPageHeader eyebrow="Medien" title="Bildbibliothek" />
      <MediaManager assets={mediaUsage(posts, assets)} />
    </AdminScreen>
  );
}
