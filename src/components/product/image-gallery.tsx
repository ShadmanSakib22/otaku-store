"use client";

import { useState } from "react";
import Image from "next/image";

export function ImageGallery({
  images,
}: {
  images: { url: string; alt: string | null }[];
}) {
  const [index, setIndex] = useState(0);
  const active = images[index] ?? images[0];

  if (!active)
    return (
      <div className="aspect-[3/4] rounded-2xl bg-muted" />
    );

  return (
    <div className="flex gap-3">
      {/* Thumbnails - vertical strip on left */}
      {images.length > 1 ? (
        <div className="flex flex-col gap-2 overflow-y-auto pb-1">
          {images.map((image, i) => (
            <button
              key={image.url + i}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === index
                  ? "border-primary ring-1 ring-primary/20"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt ?? ""}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      ) : null}

      {/* Main image */}
      <div className="relative min-h-[300px] flex-1 overflow-hidden rounded-2xl bg-muted sm:min-h-[400px]">
        <Image
          src={active.url}
          alt={active.alt ?? ""}
          fill
          priority
          sizes="(min-width: 768px) 58vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
