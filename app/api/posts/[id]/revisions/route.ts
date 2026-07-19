import {NextResponse} from "next/server";
import {currentAdmin} from "@/lib/auth";
import {getPostById, listPostRevisions} from "@/lib/content-store";

export async function GET(_request: Request, {params}: {params: Promise<{id: string}>}) {
  if (!await currentAdmin()) return NextResponse.json({error:"Unauthorized."}, {status:401});
  const {id} = await params;
  if (!await getPostById(id)) return NextResponse.json({error:"Not found."}, {status:404});
  const revisions = await listPostRevisions(id);
  return NextResponse.json({revisions: revisions.map(({snapshot, ...revision}) => ({...revision, changedFrom: snapshot.updatedAt}))});
}
