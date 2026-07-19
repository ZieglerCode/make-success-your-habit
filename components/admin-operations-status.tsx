import type {MaintenanceRun} from "@/lib/content-store";
import type {BackupManifest} from "@/lib/backup-utils";

export function AdminOperationsStatus({runs, backup, provider}: {runs:MaintenanceRun[]; backup:{directory:string;manifest:BackupManifest}|null; provider:string}) {
  const scheduler = runs.find((run) => run.type === "publish-scheduled");
  const schedulerAge = scheduler ? Date.now() - new Date(scheduler.startedAt).getTime() : Infinity;
  const backupAge = backup ? Date.now() - new Date(backup.manifest.createdAt).getTime() : Infinity;
  const cards = [
    {label:"Scheduler", value:scheduler?.status === "success" && schedulerAge < 5*60_000 ? "Aktiv" : scheduler?.status === "failed" ? "Fehlgeschlagen" : "Überfällig", ok:scheduler?.status === "success" && schedulerAge < 5*60_000, note:scheduler ? new Date(scheduler.startedAt).toLocaleString("de-DE") : "Noch kein Lauf"},
    {label:"Zuletzt veröffentlicht", value:String(scheduler?.details.published ?? 0), ok:true, note:"Beiträge im letzten Lauf"},
    {label:"Backup", value:backup && backupAge < 36*60*60_000 ? "Aktuell" : "Überfällig", ok:!!backup && backupAge < 36*60*60_000, note:backup ? new Date(backup.manifest.createdAt).toLocaleString("de-DE") : "Kein Manifest gefunden"},
    {label:"Datenspeicher", value:provider, ok:true, note:"Aktiver Content-Provider"},
    {label:"Upload-Volume", value:"/app/public/uploads", ok:true, note:"Muss in Coolify persistent sein"},
    {label:"Backup-Volume", value:"/app/backups", ok:!!backup, note:"14 tägliche Sicherungen"},
  ];
  return <div className="mt-8"><h2 className="text-xl font-semibold text-[#03182e]">Betriebsstatus</h2><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{cards.map(card=><div key={card.label} className="rounded-[22px] border border-[#b49474]/20 bg-[#fcf3e3]/65 p-4"><div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold uppercase tracking-[.12em] text-[#6b5f50]">{card.label}</p><span className={`size-2.5 rounded-full ${card.ok?"bg-[#2f6b4f]":"bg-[#a33b32]"}`} /></div><p className="mt-3 break-all text-lg font-semibold text-[#03182e]">{card.value}</p><p className="mt-1 text-xs text-[#6b5f50]">{card.note}</p></div>)}</div><div className="mt-5 rounded-[22px] border border-[#b49474]/20 bg-[#fffaf0] p-4"><p className="text-sm font-semibold">Coolify Scheduled Task (jede Minute)</p><code className="mt-3 block overflow-x-auto rounded-xl bg-[#03182e] p-3 text-xs text-[#f9f4e7]">curl -fsS -X POST -H &apos;Authorization: Bearer $MAINTENANCE_SECRET&apos; https://www.heike-ziegler.com/api/maintenance/publish-scheduled</code><p className="mt-4 text-sm font-semibold">Tägliches Backup</p><code className="mt-3 block rounded-xl bg-[#03182e] p-3 text-xs text-[#f9f4e7]">npm run backup</code></div></div>;
}
