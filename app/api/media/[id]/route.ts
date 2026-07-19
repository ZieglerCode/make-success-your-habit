import {unlink} from "node:fs/promises";
import {del} from "@vercel/blob";
import {NextResponse} from "next/server";
import {currentAdmin} from "@/lib/auth";
import {deleteMediaAsset, getMediaAssetById, updateMediaAsset} from "@/lib/content-store";
import {localUploadPath} from "@/lib/upload-paths";

type RouteContext = {
  params: Promise<{id: string}>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error: "Unauthorized."}, {status: 401});

  const {id} = await context.params;
  const body = await request.json().catch(() => null);
  const asset = await updateMediaAsset(id, {alt: typeof body?.alt === "string" ? body.alt : undefined});

  if (!asset) return NextResponse.json({error: "Not found."}, {status: 404});

  return NextResponse.json(asset);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error: "Unauthorized."}, {status: 401});

  const {id} = await context.params;
  const asset = await getMediaAssetById(id);

  if (!asset) return NextResponse.json({error: "Not found."}, {status: 404});

  await removeStoredFile(asset.url);
  const deleted = await deleteMediaAsset(id);

  return NextResponse.json({ok: deleted});
}

async function removeStoredFile(url: string) {
  try {
    if (url.startsWith("/uploads/")) {
      const filePath = localUploadPath(url);
      if (filePath) await unlink(filePath);
      return;
    }

    if (process.env.BLOB_READ_WRITE_TOKEN && /^https?:\/\//.test(url)) {
      await del(url);
    }
  } catch {
    // The DB record is the source of truth for the CMS. Missing files should not block cleanup.
  }
}
