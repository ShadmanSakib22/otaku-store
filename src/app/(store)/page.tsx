import Link from "next/link";
import { getHeroSlides, getTopSellers } from "@/lib/catalogue";
import { StoryScroll } from "@/components/store/story-scroll";
import { ProductGrid } from "@/components/product/product-grid";
import { RevealSection } from "@/components/store/reveal-section";
import { ArrowRight } from "lucide-react";

export const revalidate = 60;

const SECTION_META = [
  {
    key: "manga",
    title: "Top Manga",
    description: "The latest volumes from your favourite series.",
    accent: "border-l-primary",
    link: "/manga",
  },
  {
    key: "novels",
    title: "Top Light Novels",
    description: "Stories that go beyond the panels.",
    accent: "border-l-secondary",
    link: "/light-novels",
  },
  {
    key: "merch",
    title: "Top Merchandise",
    description: "Collectibles, figures and more.",
    accent: "border-l-accent-foreground",
    link: "/merchandise",
  },
] as const;

export default async function HomePage() {
  const [slides, manga, lightNovels, merch] = await Promise.all([
    getHeroSlides(),
    getTopSellers("MANGA", 4),
    getTopSellers("LIGHT_NOVEL", 4),
    getTopSellers("MERCH", 4),
  ]);

  const products = [manga, lightNovels, merch];

  return (
    <>
      <StoryScroll slides={slides} />

      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="space-y-20">
          {SECTION_META.map((section, i) => (
            <RevealSection key={section.key} className="space-y-6">
              <div className={`border-l-4 ${section.accent} pl-4`}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                      {section.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                  <Link
                    href={section.link}
                    className="group hidden shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:flex"
                  >
                    View all
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
              <ProductGrid products={products[i]} />
              <Link
                href={section.link}
                className="group flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:hidden"
              >
                View all {section.title.replace("Top ", "").toLowerCase()}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </RevealSection>
          ))}
        </div>
      </div>
    </>
  );
}
