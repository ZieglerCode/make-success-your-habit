export const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 80 * 1024 * 1024;

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm"]);

export type ValidatedUpload = {
  bytes: Uint8Array;
  mimeType: string;
  isImage: boolean;
};

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  return signature.every((value, index) => bytes[offset + index] === value);
}

export function detectMediaType(bytes: Uint8Array): string | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return "image/webp";
  }
  if (startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3])) return "video/webm";
  if (startsWith(bytes, [0x66, 0x74, 0x79, 0x70], 4)) return "video/mp4";
  return null;
}

export async function validateMediaUpload(file: File): Promise<ValidatedUpload> {
  const declared = file.type.toLowerCase();
  if (!IMAGE_TYPES.has(declared) && !VIDEO_TYPES.has(declared)) {
    throw new Error("Erlaubt sind JPG, PNG, WebP, MP4, MOV und WebM.");
  }

  const isImage = IMAGE_TYPES.has(declared);
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  if (file.size > maxSize) {
    throw new Error(`Das ${isImage ? "Bild" : "Video"} darf maximal ${maxSize / 1024 / 1024} MB groß sein.`);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectMediaType(bytes);
  if (!detected) throw new Error("Die Datei ist keine gültige Bild- oder Videodatei.");

  const compatible =
    detected === declared ||
    (detected === "video/mp4" && (declared === "video/mp4" || declared === "video/quicktime"));
  if (!compatible) throw new Error("Der Dateiinhalt passt nicht zum angegebenen Dateityp.");

  return {bytes, mimeType: declared === "video/quicktime" ? declared : detected, isImage};
}
