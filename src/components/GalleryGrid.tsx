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
                src={CloudinaryPresets.hero(imageUrl)}
                alt="About By Faith Bakery"
                width="1920"
                height="1080"
                loading="eager"
                className="mb-6 max-h-[400px] rounded-2xl shadow-md shadow-blue-900/10"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
