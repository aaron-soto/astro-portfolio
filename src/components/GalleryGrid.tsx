import type { ModuleDataItem } from "@ayezeewebdesigns/cms-sdk";

interface GalleryGridProps {
  items: ModuleDataItem[];
}

export default function GalleryGrid({ items }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {items.map((item) => {
        const data = item.data;
        const imageUrl = String(data.image || data.photo || "");
        const altText = String(data.alt_text);

        return (
          <div
            key={item.id}
            className="group border-lines bg-background hover:border-primary relative overflow-hidden border transition-all duration-300"
          >
            <div className="bg-background-muted relative aspect-4/3 overflow-hidden">
              <img
                src={imageUrl}
                alt={altText}
                title={altText}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
