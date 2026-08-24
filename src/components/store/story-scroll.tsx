"use client";

import Link from "next/link";
import FlowArt, { FlowSection } from "@/components/ui/story-scroll";
import { Button } from "@/components/ui/button";
export interface HeroSlideData {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  ctaText: string | null;
  ctaUrl: string | null;
}

export function StoryScroll({ slides }: { slides: HeroSlideData[] }) {
  if (slides.length === 0) return null;

  return (
    <FlowArt aria-label="Featured stories">
      {slides.map((slide, i) => (
        <FlowSection
          key={slide.id}
          aria-label={slide.title}
          backgroundImage={slide.imageUrl}
        >
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/80">
            {String(i + 1).padStart(2, "0")} / Featured
          </p>
          <hr className="my-[2vw] border-none border-t border-white/30" />
          <div>
            <h2 className="font-serif text-[clamp(1.75rem,5vw,4rem)] font-bold leading-[0.95] uppercase tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
              {slide.title}
            </h2>
          </div>
          {slide.subtitle ? (
            <p className="max-w-[44ch] text-[clamp(0.85rem,1.4vw,1.15rem)] font-normal leading-relaxed text-white/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
              {slide.subtitle}
            </p>
          ) : null}
          {slide.ctaText && slide.ctaUrl ? (
            <div className="mt-auto font-serif">
              <Button asChild variant="secondary" size="default">
                <Link href={slide.ctaUrl}>{slide.ctaText}</Link>
              </Button>
            </div>
          ) : null}
        </FlowSection>
      ))}
    </FlowArt>
  );
}
