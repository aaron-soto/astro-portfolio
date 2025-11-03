import { AnimatePresence, motion } from "framer-motion";

import type { ModuleDataItem } from "@ayezeewebdesigns/cms-sdk";
import { useState } from "react";

interface GalleryGridProps {
  items: ModuleDataItem[];
}

export default function GalleryGrid({ items }: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const selectedItem = items.find((item) => item.id === selectedImage);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {items.map((item) => {
          const data = item.data;
          const title = String(data.title || data.name || "");
          const imageUrl = String(data.image || data.photo || "");
          const caption = String(data.caption || data.description || "");
          const altText = String(data.alt_text || title);

          const isSelected = selectedImage === item.id;

          if (isSelected) {
            return <div key={item.id} className="aspect-4/3" />;
          }

          return (
            <motion.div
              key={item.id}
              onClick={() => setSelectedImage(item.id)}
              className="group border-lines bg-background hover:border-primary relative cursor-pointer overflow-hidden border transition-all duration-300 hover:shadow-xl"
            >
              <div className="bg-background-muted relative aspect-4/3 overflow-hidden">
                <img
                  src={imageUrl}
                  alt={altText}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute right-0 bottom-0 left-0 p-4 text-white md:p-6">
                    <h3 className="mb-1 text-lg leading-tight font-semibold md:text-xl">
                      {title}
                    </h3>
                    {caption && (
                      <p className="line-clamp-2 text-sm opacity-90 md:text-base">
                        {caption}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 z-40 bg-black/95 backdrop-blur-sm"
            />
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
              <motion.div
                layoutId={`img-${selectedItem.id}`}
                className="pointer-events-auto relative cursor-pointer"
                onClick={() => setSelectedImage(null)}
                transition={{
                  layout: {
                    duration: 0.25,
                    ease: [0.32, 0.72, 0, 1],
                  },
                }}
              >
                <motion.img
                  src={String(
                    selectedItem.data.image || selectedItem.data.photo
                  )}
                  alt={String(
                    selectedItem.data.alt_text || selectedItem.data.title || ""
                  )}
                  className="max-h-[85vh] max-w-[90vw] object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                />
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedImage(null)}
                  className="hover:text-primary absolute -top-12 right-0 p-2 text-4xl leading-none font-light text-white transition-colors"
                  aria-label="Close lightbox"
                >
                  &times;
                </motion.button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
