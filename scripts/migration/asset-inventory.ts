import path from "node:path";

const TYPES: Record<string, {kind: "document" | "image" | "video"; mimeType: string}> = {
  ".gif": {kind: "image", mimeType: "image/gif"},
  ".jpeg": {kind: "image", mimeType: "image/jpeg"},
  ".jpg": {kind: "image", mimeType: "image/jpeg"},
  ".mp4": {kind: "video", mimeType: "video/mp4"},
  ".pdf": {kind: "document", mimeType: "application/pdf"},
  ".png": {kind: "image", mimeType: "image/png"},
  ".svg": {kind: "image", mimeType: "image/svg+xml"},
  ".webp": {kind: "image", mimeType: "image/webp"},
};

export function classifyAsset(filename: string) {
  return TYPES[path.extname(filename).toLowerCase()] || {
    kind: "other" as const,
    mimeType: "application/octet-stream",
  };
}
