import {localUploadResponse} from "@/lib/local-upload-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, {params}: {params: Promise<{filename: string}>}) {
  const {filename} = await params;
  return localUploadResponse(filename);
}
