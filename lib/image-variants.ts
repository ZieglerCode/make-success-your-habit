import sharp from "sharp";

const MAX_EDGE = 12_000;
const MAX_PIXELS = 40_000_000;

export type FocalPoint = {x: number; y: number};
export type ImageVariant = {buffer: Buffer; width: number; height: number; mimeType: "image/webp"};
export type ProcessedImage = {
  width: number;
  height: number;
  focalPoint: FocalPoint;
  variants: Record<"sm" | "md" | "lg" | "social", ImageVariant>;
};

function normalizedFocus(value?: FocalPoint): FocalPoint {
  return {
    x: Math.min(1, Math.max(0, value?.x ?? 0.5)),
    y: Math.min(1, Math.max(0, value?.y ?? 0.5)),
  };
}

async function responsive(input: Uint8Array, requestedWidth: number): Promise<ImageVariant> {
  const buffer = await sharp(input, {limitInputPixels: MAX_PIXELS})
    .rotate()
    .resize({width: requestedWidth, withoutEnlargement: true})
    .webp({quality: 82})
    .toBuffer();
  const metadata = await sharp(buffer).metadata();
  return {buffer, width: metadata.width!, height: metadata.height!, mimeType: "image/webp"};
}

export async function createImageVariants(input: Uint8Array, focusInput?: FocalPoint): Promise<ProcessedImage> {
  const metadata = await sharp(input, {limitInputPixels: MAX_PIXELS}).metadata();
  const rotated = metadata.orientation && metadata.orientation >= 5;
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;
  if (!width || !height) throw new Error("Die Bildabmessungen konnten nicht gelesen werden.");
  if (width > MAX_EDGE || height > MAX_EDGE || width * height > MAX_PIXELS) {
    throw new Error("Die Bildabmessungen sind zu groß (maximal 12.000 px bzw. 40 MP).");
  }

  const focalPoint = normalizedFocus(focusInput);
  const ratio = 1200 / 630;
  let left = 0;
  let top = 0;
  let cropWidth = width;
  let cropHeight = height;
  if (width / height > ratio) {
    cropWidth = Math.round(height * ratio);
    left = Math.round((width - cropWidth) * focalPoint.x);
  } else {
    cropHeight = Math.round(width / ratio);
    top = Math.round((height - cropHeight) * focalPoint.y);
  }
  left = Math.max(0, Math.min(width - cropWidth, left));
  top = Math.max(0, Math.min(height - cropHeight, top));

  const socialBuffer = await sharp(input, {limitInputPixels: MAX_PIXELS})
    .rotate()
    .extract({left, top, width: cropWidth, height: cropHeight})
    .resize(1200, 630)
    .webp({quality: 82})
    .toBuffer();

  return {
    width,
    height,
    focalPoint,
    variants: {
      sm: await responsive(input, 640),
      md: await responsive(input, 1280),
      lg: await responsive(input, 1920),
      social: {buffer: socialBuffer, width: 1200, height: 630, mimeType: "image/webp"},
    },
  };
}
