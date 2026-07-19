export const COVER_PRESETS = ["article", "card", "featured", "social"] as const;

export type CoverPreset = (typeof COVER_PRESETS)[number];

export type CoverCrop = {
  x: number;
  y: number;
  zoom: number;
};

export type CoverCrops = Record<CoverPreset, CoverCrop>;

export type CropRegion = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export const COVER_FORMATS: Record<
  CoverPreset,
  {aspect: number; description: string; label: string}
> = {
  article: {aspect: 16 / 9, description: "Großes Bild im Blogartikel", label: "Artikel"},
  card: {aspect: 16 / 10, description: "Karten in der Blogübersicht", label: "Blogkarte"},
  featured: {aspect: 4 / 3, description: "Hervorgehobener Beitrag auf der Startseite", label: "Featured"},
  social: {aspect: 1.91, description: "Vorschau beim Teilen", label: "Social"},
};

export const DEFAULT_COVER_CROP: CoverCrop = {x: 0.5, y: 0.5, zoom: 1};

export const DEFAULT_COVER_CROPS: CoverCrops = {
  article: {...DEFAULT_COVER_CROP},
  card: {...DEFAULT_COVER_CROP},
  featured: {...DEFAULT_COVER_CROP},
  social: {...DEFAULT_COVER_CROP},
};

export function normalizeCoverCrop(value: unknown): CoverCrop {
  const crop = isRecord(value) ? value : {};
  return {
    x: clamp(toNumber(crop.x, DEFAULT_COVER_CROP.x), 0, 1),
    y: clamp(toNumber(crop.y, DEFAULT_COVER_CROP.y), 0, 1),
    zoom: clamp(toNumber(crop.zoom, DEFAULT_COVER_CROP.zoom), 1, 3),
  };
}

export function normalizeCoverCrops(value: unknown): CoverCrops {
  let candidate = value;
  if (typeof candidate === "string") {
    try {
      candidate = JSON.parse(candidate);
    } catch {
      candidate = null;
    }
  }

  const crops = isRecord(candidate) ? candidate : {};
  return {
    article: normalizeCoverCrop(crops.article),
    card: normalizeCoverCrop(crops.card),
    featured: normalizeCoverCrop(crops.featured),
    social: normalizeCoverCrop(crops.social),
  };
}

export function calculateCropRegion(
  imageWidth: number,
  imageHeight: number,
  preset: CoverPreset,
  cropValue: CoverCrop,
): CropRegion {
  const crop = normalizeCoverCrop(cropValue);
  const imageAspect = imageWidth / imageHeight;
  const targetAspect = COVER_FORMATS[preset].aspect;

  let baseWidth: number;
  let baseHeight: number;
  if (imageAspect > targetAspect) {
    baseHeight = imageHeight;
    baseWidth = baseHeight * targetAspect;
  } else {
    baseWidth = imageWidth;
    baseHeight = baseWidth / targetAspect;
  }

  const width = baseWidth / crop.zoom;
  const height = baseHeight / crop.zoom;
  const left = (imageWidth - width) * crop.x;
  const top = (imageHeight - height) * crop.y;

  return {height, left, top, width};
}

export function copyCoverCrops(crops: CoverCrops): CoverCrops {
  return Object.fromEntries(
    COVER_PRESETS.map((preset) => [preset, {...crops[preset]}]),
  ) as CoverCrops;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toNumber(value: unknown, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}
