"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

export interface HeroSlideData {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  ctaText: string | null;
  ctaUrl: string | null;
}

export function HeroCarousel({ slides }: { slides: HeroSlideData[] }) {
  if (slides.length === 0) return null;

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>
            <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 p-6 text-center text-white">
                <h2 className="font-heading text-3xl font-bold md:text-5xl">
                  {slide.title}
                </h2>
                {slide.subtitle ? (
                  <p className="max-w-xl text-sm md:text-lg">{slide.subtitle}</p>
                ) : null}
                {slide.ctaText && slide.ctaUrl ? (
                  <Button asChild variant="secondary" size="lg">
                    <Link href={slide.ctaUrl}>{slide.ctaText}</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
