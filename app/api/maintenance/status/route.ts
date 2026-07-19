import {NextResponse} from "next/server";
import {currentAdmin} from "@/lib/auth";
import {maintenanceStatus} from "@/lib/content-store";

export async function GET() {
  if (!await currentAdmin()) return NextResponse.json({error:"Unauthorized."}, {status:401});
  return NextResponse.json({runs:await maintenanceStatus()});
}
