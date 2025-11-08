// GalleryGrid.tsx (or .jsx)

import {
  CloudinaryPresets,
  buildCloudinaryUrl,
  generateSrcSet,
} from "../lib/cloudinary";

import type { ModuleDataItem } from "@ayezeewebdesigns/cms-sdk";

interface GalleryGridProps {
  items: ModuleDataItem[];
}

export default function GalleryGrid({ items }: GalleryGridProps) {
  return (
    <div className="flex justify-center">
      <div className="grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item) => {
          const imageUrl = (item.data.image ||
            item.data.gallery_image) as string;

          if (!imageUrl) return null;

          return (
            <div
              key={item.id}
              className="relative aspect-square overflow-hidden bg-gray-900"
            >
              <img
                src={buildCloudinaryUrl(imageUrl, {
                  width: 400,
                  height: 400,
                  crop: "fill",
                  gravity: "auto",
                  quality: "auto:good",
                  format: "auto",
                })}
                srcSet={generateSrcSet(imageUrl, [400, 600, 800], {
                  height: 400, // Match aspect-square (1:1 ratio)
                  crop: "fill",
                  gravity: "auto",
                  quality: "auto:good",
                  format: "auto",
                })}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                alt={"Gallery image"}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                width="400"
                height="400"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
