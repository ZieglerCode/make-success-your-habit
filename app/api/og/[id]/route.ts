import {readFile} from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {calculateCropRegion} from "@/lib/cover-crop";
import {getPostById} from "@/lib/content-store";
import {localUploadPath} from "@/lib/upload-paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OUTPUT_WIDTH = 1200;
const OUTPUT_HEIGHT = 630;
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;

export async function GET(_request: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const post = await getPostById(id);

  if (!post || post.status !== "published" || isVideoUrl(post.coverImage)) {
    return new Response("Not found", {status: 404});
  }

  try {
    const source = await readCoverSource(post.coverImage);
    const metadata = await sharp(source).metadata();
    if (!metadata.width || !metadata.height) throw new Error("Cover dimensions unavailable.");

    const crop = calculateCropRegion(metadata.width, metadata.height, "social", post.coverCrops.social);
    const left = Math.max(0, Math.round(crop.left));
    const top = Math.max(0, Math.round(crop.top));
    const width = Math.min(metadata.width - left, Math.max(1, Math.round(crop.width)));
    const height = Math.min(metadata.height - top, Math.max(1, Math.round(crop.height)));

    const image = await sharp(source)
      .extract({height, left, top, width})
      .resize(OUTPUT_WIDTH, OUTPUT_HEIGHT, {fit: "fill"})
      .webp({quality: 88})
      .toBuffer();

    return new Response(new Uint8Array(image), {
      headers: {
        "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        "content-type": "image/webp",
      },
    });
  } catch (error) {
    console.error("Could not render social cover.", error);
    return new Response("Cover unavailable", {status: 404});
  }
}

async function readCoverSource(url: string) {
  const uploadPath = localUploadPath(url);
  if (uploadPath) return readFile(uploadPath);

  if (url.startsWith("/media/")) {
    const publicRoot = path.resolve(process.cwd(), "public");
    const mediaPath = path.resolve(publicRoot, `.${decodeURIComponent(url.split("?")[0])}`);
    if (!mediaPath.startsWith(`${publicRoot}${path.sep}`)) throw new Error("Invalid media path.");
    return readFile(mediaPath);
  }

  const remote = new URL(url);
  if (!["http:", "https:"].includes(remote.protocol)) throw new Error("Unsupported cover URL.");
  const response = await fetch(remote, {cache: "no-store", signal: AbortSignal.timeout(10_000)});
  if (!response.ok) throw new Error(`Cover fetch failed: ${response.status}`);
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_SOURCE_BYTES) throw new Error("Cover file is too large.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_SOURCE_BYTES) throw new Error("Cover file is too large.");
  return bytes;
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm)(\?|#|$)/i.test(url);
}
