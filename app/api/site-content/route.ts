import {NextResponse} from "next/server";
import {currentAdmin} from "@/lib/auth";
import {getSiteContent, updateSiteContent} from "@/lib/content-store";

export async function GET() {
  return NextResponse.json(await getSiteContent());
}

export async function PATCH(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error: "Unauthorized."}, {status: 401});

  return NextResponse.json(await updateSiteContent(await request.json()));
}
