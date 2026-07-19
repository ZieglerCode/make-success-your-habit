import path from "node:path";

export function uploadDirectory() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
}

export function payloadMediaDirectory() {
  return process.env.PAYLOAD_MEDIA_DIR || path.join(process.cwd(), "media");
}

export function localUploadPath(url: string) {
  const prefix = "/uploads/";
  if (!url.startsWith(prefix)) return null;

  const relativePath = url.slice(prefix.length);
  const root = path.resolve(uploadDirectory());
  const target = path.resolve(root, relativePath);
  if (!target.startsWith(`${root}${path.sep}`)) return null;
  return target;
}
