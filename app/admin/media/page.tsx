import {AdminPageHeader} from "@/components/admin-shell";
import {AdminScreen} from "@/components/admin-screen";
import {MediaManager} from "@/components/media-manager";
import {listMediaAssets} from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  return (
    <AdminScreen>
      <AdminPageHeader eyebrow="Medien" title="Bildbibliothek" />
      <MediaManager assets={await listMediaAssets()} />
    </AdminScreen>
  );
}
