"use client";

import SafeImage from "@/components/ui/SafeImage";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type GalleryImage = { url: string; alt: string | null };

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  if (images.length === 0) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg bg-surface-container-low font-label-caps text-label-caps uppercase text-on-surface-variant/40">
        Görsel yok
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-base">
      <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-surface-container-low">
        <SafeImage
          src={current.url}
          alt={current.alt ?? name}
          fill
          priority
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-base grid grid-cols-4 gap-base">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setActive(i)}
              aria-label={`Görsel ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative aspect-square w-full overflow-hidden rounded bg-surface-container-low transition-colors duration-300",
                i === active
                  ? "border-2 border-primary"
                  : "border border-outline-variant/30 hover:border-primary"
              )}
            >
              <SafeImage
                src={img.url}
                alt=""
                fill
                sizes="15vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
