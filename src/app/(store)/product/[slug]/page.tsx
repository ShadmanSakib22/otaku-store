import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getSimilarProducts } from "@/lib/catalogue";
import { ImageGallery } from "@/components/product/image-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductVariantClient } from "./product-client";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.summary ?? undefined };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const variants = product.variants.map((v) => ({
    id: v.id,
    name: v.name,
    size: v.size,
    color: v.color,
    price: Number(v.price),
    quantity: v.inventory?.quantity ?? 0,
    lowStockAt: v.inventory?.lowStockAt ?? 0,
  }));

  const defaultVariant = variants[0];
  const authors = product.authors.map((a) => a.author.name).join(", ");
  const genres = product.genres.map((g) => g.genre.name);

  const similar = await getSimilarProducts(product.id, product.category.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
        {/* Image - takes 7 cols on desktop */}
        <div className="md:col-span-7">
          <ImageGallery
            images={product.images.map((i) => ({ url: i.url, alt: i.alt }))}
          />
        </div>

        {/* Product info - takes 5 cols, sticky on desktop */}
        <div className="md:col-span-5">
          <div className="md:sticky md:top-24">
            {/* Category */}
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {product.category.name}
            </p>

            {/* Title */}
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {product.name}
            </h1>

            {/* Authors */}
            {authors ? (
              <p className="mt-2 text-sm text-muted-foreground">
                by {authors}
              </p>
            ) : null}

            {/* Summary */}
            {product.summary ? (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {product.summary}
              </p>
            ) : null}

            {/* Divider */}
            <div className="my-6 border-t" />

            {/* Variant picker + Price + CTA */}
            <ProductVariantClient
              variants={variants}
              defaultVariantId={defaultVariant?.id ?? ""}
            />

            {/* Divider */}
            <div className="my-6 border-t" />

            {/* Genres */}
            {genres.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-none bg-secondary/50 px-3 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Description */}
            {product.description ? (
              <div className="mt-6">
                <h2 className="mb-2 text-sm font-semibold">Description</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </div>
            ) : null}

            {/* Book metadata */}
            {product.bookMetadata ? (
              <div className="mt-6 rounded-lg border bg-muted/30 p-4">
                <h2 className="mb-3 text-sm font-semibold">Details</h2>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {product.publisher ? (
                    <>
                      <dt className="text-muted-foreground">Publisher</dt>
                      <dd className="font-medium">{product.publisher.name}</dd>
                    </>
                  ) : null}
                  <dt className="text-muted-foreground">Volume</dt>
                  <dd className="font-medium">
                    {product.bookMetadata.volume}
                  </dd>
                  {product.bookMetadata.isbn ? (
                    <>
                      <dt className="text-muted-foreground">ISBN</dt>
                      <dd className="font-medium">
                        {product.bookMetadata.isbn}
                      </dd>
                    </>
                  ) : null}
                  {product.bookMetadata.language ? (
                    <>
                      <dt className="text-muted-foreground">Language</dt>
                      <dd className="font-medium">
                        {product.bookMetadata.language}
                      </dd>
                    </>
                  ) : null}
                  {product.bookMetadata.pageCount ? (
                    <>
                      <dt className="text-muted-foreground">Pages</dt>
                      <dd className="font-medium">
                        {product.bookMetadata.pageCount}
                      </dd>
                    </>
                  ) : null}
                </dl>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Similar items */}
      {similar.length > 0 ? (
        <section className="mt-16 border-t pt-10">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">
            You might also like
          </h2>
          <ProductGrid products={similar} />
        </section>
      ) : null}
    </div>
  );
}
