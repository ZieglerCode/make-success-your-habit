import {NextResponse} from "next/server";
import {currentAdmin} from "@/lib/auth";
import {restorePostRevision} from "@/lib/content-store";

export async function POST(_request: Request, {params}: {params: Promise<{id:string; revisionId:string}>}) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error:"Unauthorized."}, {status:401});
  const {id, revisionId} = await params;
  try {
    const post = await restorePostRevision(id, revisionId, admin.email);
    return post ? NextResponse.json(post) : NextResponse.json({error:"Not found."}, {status:404});
  } catch (error) {
    const conflict = error instanceof Error && /unique/i.test(error.message);
    return NextResponse.json({error: conflict ? "Der Slug der Version ist bereits vergeben." : "Version konnte nicht wiederhergestellt werden."}, {status: conflict ? 409 : 400});
  }
}
