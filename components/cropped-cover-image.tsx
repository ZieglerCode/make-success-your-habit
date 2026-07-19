"use client";

import {useEffect, useState} from "react";
import {
  calculateCropRegion,
  normalizeCoverCrops,
  type CoverCrops,
  type CoverPreset,
} from "@/lib/cover-crop";

export function CroppedCoverImage({
  alt,
  className = "",
  crops,
  imageClassName = "",
  preset,
  src,
}: {
  alt: string;
  className?: string;
  crops: CoverCrops;
  imageClassName?: string;
  preset: CoverPreset;
  src: string;
}) {
  const [naturalSize, setNaturalSize] = useState<{height: number; width: number} | null>(null);
  const normalized = normalizeCoverCrops(crops);
  const region = naturalSize
    ? calculateCropRegion(naturalSize.width, naturalSize.height, preset, normalized[preset])
    : null;

  useEffect(() => {
    setNaturalSize(null);
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-[#ead8c2] ${className}`}>
      <img
        alt={alt}
        className={`absolute max-w-none select-none ${region ? "" : "inset-0 h-full w-full object-cover"} ${imageClassName}`}
        draggable={false}
        onLoad={(event) => {
          const image = event.currentTarget;
          setNaturalSize({height: image.naturalHeight, width: image.naturalWidth});
        }}
        src={src}
        style={
          region && naturalSize
            ? {
                height: `${(naturalSize.height / region.height) * 100}%`,
                left: `${-(region.left / region.width) * 100}%`,
                top: `${-(region.top / region.height) * 100}%`,
                width: `${(naturalSize.width / region.width) * 100}%`,
              }
            : undefined
        }
      />
    </div>
  );
}
