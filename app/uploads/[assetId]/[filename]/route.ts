import path from "node:path";
import {localUploadResponse} from "@/lib/local-upload-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, {params}: {params: Promise<{assetId:string;filename:string}>}) {
  const {assetId, filename} = await params;
  if (!/^[a-f0-9-]{36}$/i.test(assetId)) return new Response("Not found.", {status:404});
  return localUploadResponse(filename, path.join(process.cwd(), "public", "uploads", assetId));
}
