import {NextResponse} from "next/server";
import {currentAdmin} from "@/lib/auth";
import {getPostRevision} from "@/lib/content-store";

export async function GET(_request: Request, {params}: {params: Promise<{id:string; revisionId:string}>}) {
  if (!await currentAdmin()) return NextResponse.json({error:"Unauthorized."}, {status:401});
  const {id, revisionId} = await params;
  const revision = await getPostRevision(id, revisionId);
  return revision ? NextResponse.json(revision) : NextResponse.json({error:"Not found."}, {status:404});
}
