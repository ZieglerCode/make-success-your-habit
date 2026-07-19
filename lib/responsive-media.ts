import type {MediaAsset} from "@/lib/content-store";

export function mediaImageProps(asset: Pick<MediaAsset, "url" | "variants" | "width" | "height" | "focalX" | "focalY">) {
  const candidates = Object.values(asset.variants || {})
    .filter((variant) => variant.url && variant.width)
    .sort((a, b) => a.width - b.width);
  return {
    src: asset.url,
    srcSet: candidates.length ? candidates.map((variant) => `${variant.url} ${variant.width}w`).join(", ") : undefined,
    width: asset.width || undefined,
    height: asset.height || undefined,
    style: {objectPosition: `${asset.focalX * 100}% ${asset.focalY * 100}%`},
  };
}
