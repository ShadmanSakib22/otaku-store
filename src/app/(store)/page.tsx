import Link from "next/link";
import { getHeroSlides, getTopSellers } from "@/lib/catalogue";
import { StoryScroll } from "@/components/store/story-scroll";
import { ProductGrid } from "@/components/product/product-grid";
import { ArrowRight } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const [slides, manga, lightNovels, merch] = await Promise.all([
    getHeroSlides(),
    getTopSellers("MANGA", 4),
    getTopSellers("LIGHT_NOVEL", 4),
    getTopSellers("MERCH", 4),
  ]);

  const sections = [
    { title: "Top Manga", products: manga, link: "/manga" },
    { title: "Top Light Novels", products: lightNovels, link: "/light-novels" },
    { title: "Top Merchandise", products: merch, link: "/merchandise" },
  ];

  return (
    <>
      <StoryScroll slides={slides} />

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-8">
        {sections.map((section) => (
          <section key={section.title} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold">{section.title}</h2>
              <Link
                href={section.link}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                Discover <ArrowRight className="size-3" />
              </Link>
            </div>
            <ProductGrid products={section.products} />
          </section>
        ))}
      </div>
    </>
  );
}
