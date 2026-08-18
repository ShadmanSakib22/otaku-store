"use client";

import { useState } from "react";
import Image from "next/image";

export function ImageGallery({ images }: { images: { url: string; alt: string | null }[] }) {
  const [index, setIndex] = useState(0);
  const active = images[index] ?? images[0];

  if (!active) return <div className="aspect-[3/4] bg-muted" />;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
        <Image
          src={active.url}
          alt={active.alt ?? ""}
          fill
          sizes="(min-width: 768px) 40vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2">
          {images.map((image, i) => (
            <button
              key={image.url + i}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative aspect-square w-16 overflow-hidden rounded-md border-2 ${i === index ? "border-primary" : "border-transparent"}`}
            >
              <Image src={image.url} alt={image.alt ?? ""} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
