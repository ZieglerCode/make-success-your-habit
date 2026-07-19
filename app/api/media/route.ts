import {randomUUID} from "node:crypto";
import {NextResponse} from "next/server";
import {currentAdmin} from "@/lib/auth";
import {createMediaAsset, listMediaAssets, type MediaAsset} from "@/lib/content-store";
import {createImageVariants, type ProcessedImage} from "@/lib/image-variants";
import {storeMediaGroup, type StoredPart} from "@/lib/media-storage";
import {validateMediaUpload} from "@/lib/media-validation";

export async function GET() {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error: "Unauthorized."}, {status: 401});
  return NextResponse.json({assets: await listMediaAssets()});
}

export async function POST(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error: "Unauthorized."}, {status: 401});

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const alt = String(formData.get("alt") || "").trim();
    if (!(file instanceof File)) {
      return NextResponse.json({error: "Bitte eine Bild- oder Videodatei auswählen."}, {status: 400});
    }

    const validated = await validateMediaUpload(file);
    const assetId = randomUUID();
    const extension = ({"image/jpeg":".jpg","image/png":".png","image/webp":".webp","video/mp4":".mp4","video/quicktime":".mov","video/webm":".webm"} as Record<string,string>)[validated.mimeType];
    const originalName = `original${extension}`;
    const parts: StoredPart[] = [{name: originalName, bytes: validated.bytes, contentType: validated.mimeType}];
    let width: number | null = null;
    let height: number | null = null;
    let defaultPart = originalName;
    let variantMeta: MediaAsset["variants"] = {};
    let processed: ProcessedImage | null = null;

    if (validated.isImage) {
      processed = await createImageVariants(validated.bytes);
      width = processed.width;
      height = processed.height;
      for (const [key, variant] of Object.entries(processed.variants)) {
        const name = `${key}.webp`;
        parts.push({name, bytes: variant.buffer, contentType: variant.mimeType});
      }
      defaultPart = "lg.webp";
    }

    const urls = await storeMediaGroup(assetId, parts);
    if (processed) {
      variantMeta = Object.fromEntries(Object.entries(processed.variants).map(([key, variant]) => [key, {
        url: urls[`${key}.webp`], width: variant.width, height: variant.height,
      }]));
    }

    const asset = await createMediaAsset({
      id: assetId,
      alt,
      filename: file.name,
      mimeType: validated.mimeType,
      size: file.size,
      url: urls[defaultPart],
      originalUrl: urls[originalName],
      variants: variantMeta,
      width,
      height,
      focalX: 0.5,
      focalY: 0.5,
    });
    return NextResponse.json(asset, {status: 201});
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : "Upload fehlgeschlagen."}, {status: 400});
  }
}
