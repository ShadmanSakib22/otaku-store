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
          {/* full-bleed band: cancel the section's own side padding, then re-apply it
              so the dark ribbon reaches the screen edges while the text stays inset */}
          <div className="-mx-[4vw] flex w-[calc(100%+8vw)] flex-1 flex-col items-center justify-center px-[4vw] text-center">
            <div className="relative w-full ">
              {/* oversized faint index numeral for depth/scale, sitting behind the title */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-6 select-none font-serif text-[22vw] font-bold leading-none text-white/[0.08] sm:-top-10 sm:text-[13rem]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div
                className="relative bg-black/45 px-4 py-10 sm:px-12 sm:py-14"
                style={{
                  maskImage:
                    "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                }}
              >
                <div className="mb-4 flex items-center justify-center gap-3">
                  <span className="h-px w-8 bg-white/40" />
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-white/80">
                    Featured
                  </p>
                  <span className="h-px w-8 bg-white/40" />
                </div>

                <h2 className="font-serif text-[clamp(2rem,6vw,4.5rem)] font-bold uppercase leading-[0.95] tracking-tight text-white">
                  {slide.title}
                </h2>

                {slide.subtitle ? (
                  <p className="mx-auto mt-4 max-w-[46ch] text-[clamp(0.9rem,1.4vw,1.15rem)] leading-relaxed text-white/85">
                    {slide.subtitle}
                  </p>
                ) : null}

                {slide.ctaText && slide.ctaUrl ? (
                  <div className="mt-8 font-serif">
                    <Button asChild variant="secondary" size="default">
                      <Link href={slide.ctaUrl}>{slide.ctaText}</Link>
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </FlowSection>
      ))}
    </FlowArt>
  );
}
