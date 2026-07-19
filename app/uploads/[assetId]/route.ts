import {localUploadResponse} from "@/lib/local-upload-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{assetId: string}>;
};

export async function GET(_request: Request, context: RouteContext) {
  const {assetId} = await context.params;
  return localUploadResponse(assetId);
}
