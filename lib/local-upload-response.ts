import {readFile} from "node:fs/promises";
import path from "node:path";

const CONTENT_TYPES: Record<string, string> = {
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".mov": "video/quicktime",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".webm": "video/webm",
  ".webp": "image/webp",
};

export async function localUploadResponse(
  filename: string,
  uploadDirectory = path.join(process.cwd(), "public", "uploads"),
) {
  if (!isSafeFilename(filename)) return new Response("Not found.", {status: 404});

  try {
    const file = await readFile(path.join(uploadDirectory, filename));
    return new Response(new Uint8Array(file), {
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
        "content-type": CONTENT_TYPES[path.extname(filename).toLowerCase()] || "application/octet-stream",
      },
    });
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return new Response("Not found.", {status: 404});
    }

    return new Response("Upload konnte nicht geladen werden.", {status: 500});
  }
}

function isSafeFilename(filename: string) {
  return (
    Boolean(filename) &&
    filename === path.basename(filename) &&
    !filename.includes("\\") &&
    !filename.includes("\0")
  );
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
