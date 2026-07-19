import {NextResponse} from "next/server";
import {failMaintenanceRun, finishMaintenanceRun, publishDueScheduledPosts, startMaintenanceRun} from "@/lib/content-store";
import {isMaintenanceAuthorized} from "@/lib/maintenance-auth";

export async function POST(request: Request) {
  if (!isMaintenanceAuthorized(request)) return NextResponse.json({error:"Unauthorized."}, {status:401});
  const run = await startMaintenanceRun("publish-scheduled");
  if (!run) return NextResponse.json({error:"Ein Veröffentlichungslauf ist bereits aktiv."}, {status:409});
  const started = Date.now();
  try {
    const published = await publishDueScheduledPosts();
    const details = {published, durationMs:Date.now()-started};
    await finishMaintenanceRun(run.id, details);
    return NextResponse.json({ok:true, ...details});
  } catch (error) {
    await failMaintenanceRun(run.id, error);
    return NextResponse.json({error:"Veröffentlichungslauf fehlgeschlagen."}, {status:500});
  }
}
