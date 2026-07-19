import {NextResponse} from "next/server";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {currentAdmin} from "@/lib/auth";
import {deleteMediaAsset, getMediaAssetById, updateMediaAsset} from "@/lib/content-store";
import {deleteMediaGroup} from "@/lib/media-storage";
import {storeMediaGroup} from "@/lib/media-storage";
import {createImageVariants} from "@/lib/image-variants";

type RouteContext = {
  params: Promise<{id: string}>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error: "Unauthorized."}, {status: 401});

  const {id} = await context.params;
  const body = await request.json().catch(() => null);
  const existing = await getMediaAssetById(id);
  if (!existing) return NextResponse.json({error: "Not found."}, {status: 404});
  const focalX = typeof body?.focalX === "number" ? Math.max(0, Math.min(1, body.focalX)) : existing.focalX;
  const focalY = typeof body?.focalY === "number" ? Math.max(0, Math.min(1, body.focalY)) : existing.focalY;
  let variants = existing.variants;
  if (existing.mimeType.startsWith("image/") && (focalX !== existing.focalX || focalY !== existing.focalY)) {
    const bytes = existing.originalUrl.startsWith("/")
      ? await readFile(path.join(process.cwd(), "public", existing.originalUrl.replace(/^\//, "")))
      : new Uint8Array(await (await fetch(existing.originalUrl)).arrayBuffer());
    const processed = await createImageVariants(bytes, {x:focalX,y:focalY});
    const urls = await storeMediaGroup(id, [{name:"social.webp", bytes:processed.variants.social.buffer, contentType:"image/webp"}]);
    variants = {...existing.variants, social:{url:urls["social.webp"], width:1200, height:630}};
  }
  const asset = await updateMediaAsset(id, {
    alt: typeof body?.alt === "string" ? body.alt : undefined,
    focalX,
    focalY,
    variants,
  });

  if (!asset) return NextResponse.json({error: "Not found."}, {status: 404});

  return NextResponse.json(asset);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error: "Unauthorized."}, {status: 401});

  const {id} = await context.params;
  const asset = await getMediaAssetById(id);

  if (!asset) return NextResponse.json({error: "Not found."}, {status: 404});

  await deleteMediaGroup(asset.id, [asset.originalUrl, asset.url, ...Object.values(asset.variants).map((variant) => variant.url)]);
  const deleted = await deleteMediaAsset(id);

  return NextResponse.json({ok: deleted});
}
