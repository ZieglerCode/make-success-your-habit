import {AdminPageHeader} from "@/components/admin-shell";
import {AdminScreen} from "@/components/admin-screen";
import {AdminOperationsStatus} from "@/components/admin-operations-status";
import {latestBackup} from "@/lib/backup-utils";
import {contentStorageProvider, maintenanceStatus} from "@/lib/content-store";

export default async function AdminSettingsPage() {
  const [runs, backup] = await Promise.all([maintenanceStatus(), latestBackup()]);
  return (
    <AdminScreen>
      <AdminPageHeader eyebrow="Settings" title="Admin-Zugang" />
      <div className="max-w-3xl divide-y divide-[#b49474]/20 border-y border-[#b49474]/20">
        <div className="grid gap-2 py-6 md:grid-cols-[220px_1fr]">
          <p className="font-medium">Admin E-Mail</p>
          <p className="text-[#6b5f50]">{process.env.ADMIN_EMAIL || "heike@make-success-your-habit.com"}</p>
        </div>
        <div className="grid gap-2 py-6 md:grid-cols-[220px_1fr]">
          <p className="font-medium">Passwort</p>
          <p className="text-[#6b5f50]">
            Über <code className="rounded bg-[#fcf3e3] px-2 py-1">ADMIN_PASSWORD</code> oder{" "}
            <code className="rounded bg-[#fcf3e3] px-2 py-1">ADMIN_PASSWORD_HASH</code> in der
            Umgebung konfigurierbar.
          </p>
        </div>
      </div>
      <AdminOperationsStatus runs={runs} backup={backup} provider={contentStorageProvider()} />
    </AdminScreen>
  );
}
