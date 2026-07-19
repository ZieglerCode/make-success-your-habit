import {mkdir, writeFile} from "node:fs/promises";
import path from "node:path";
import {put} from "@vercel/blob";
import {NextResponse} from "next/server";
import {currentAdmin} from "@/lib/auth";
import {createMediaAsset, listMediaAssets} from "@/lib/content-store";
import {uploadDirectory} from "@/lib/upload-paths";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_VIDEO_SIZE = 80 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm"]);
const FALLBACK_MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

export async function GET() {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error: "Unauthorized."}, {status: 401});

  return NextResponse.json({assets: await listMediaAssets()});
}

export async function POST(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error: "Unauthorized."}, {status: 401});

  const formData = await request.formData();
  const file = formData.get("file");
  const alt = String(formData.get("alt") || "");

  if (!(file instanceof File)) {
    return NextResponse.json({error: "Bitte eine Bild- oder Videodatei auswählen."}, {status: 400});
  }

  const extension = path.extname(file.name).toLowerCase();
  const mimeType = file.type || FALLBACK_MIME_TYPES[extension] || "";
  const isImage = ALLOWED_IMAGE_TYPES.has(mimeType);
  const isVideo = ALLOWED_VIDEO_TYPES.has(mimeType);

  if (!isImage && !isVideo) {
    return NextResponse.json(
      {error: "Erlaubt sind JPG, PNG, WebP, MP4, MOV und WebM."},
      {status: 400},
    );
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    const label = isVideo ? "Video" : "Bild";
    const megabytes = Math.round(maxSize / 1024 / 1024);
    return NextResponse.json({error: `Das ${label} darf maximal ${megabytes} MB groß sein.`}, {status: 400});
  }

  const safeExtension = extension || (isVideo ? ".mp4" : ".webp");
  const safeBase = path
    .basename(file.name, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const filename = `${safeBase || (isVideo ? "video" : "bild")}-${Date.now()}${safeExtension}`;
  let url: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    url = blob.url;
  } else {
    const uploadDir = uploadDirectory();
    const diskPath = path.join(uploadDir, filename);

    await mkdir(uploadDir, {recursive: true});
    await writeFile(diskPath, Buffer.from(await file.arrayBuffer()));
    url = `/uploads/${filename}`;
  }

  const asset = await createMediaAsset({
    alt,
    filename,
    mimeType,
    size: file.size,
    url,
  });

  return NextResponse.json(asset, {status: 201});
}
