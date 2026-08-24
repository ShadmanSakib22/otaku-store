import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalogue";
import { ImageGallery } from "@/components/product/image-gallery";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <ImageGallery
          images={product.images.map((i) => ({ url: i.url, alt: i.alt }))}
        />
        <div className="space-y-4">
          <div className="space-y-1">
            <Badge variant="outline">{product.category.name}</Badge>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            {authors ? (
              <p className="text-muted-foreground">By {authors}</p>
            ) : null}
          </div>

          <ProductVariantClient
            variants={variants}
            defaultVariantId={defaultVariant?.id ?? ""}
          />

          {product.summary ? (
            <p className="text-muted-foreground">{product.summary}</p>
          ) : null}
          <p className="whitespace-pre-line text-sm leading-relaxed">
            {product.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>

          {product.publisher ? (
            <p className="text-sm text-muted-foreground">
              Publisher: {product.publisher.name}
            </p>
          ) : null}
          {product.bookMetadata ? (
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt>Volume</dt>
              <dd>{product.bookMetadata.volume}</dd>
              {product.bookMetadata.isbn ? (
                <>
                  <dt>ISBN</dt>
                  <dd>{product.bookMetadata.isbn}</dd>
                </>
              ) : null}
              {product.bookMetadata.language ? (
                <>
                  <dt>Language</dt>
                  <dd>{product.bookMetadata.language}</dd>
                </>
              ) : null}
              {product.bookMetadata.pageCount ? (
                <>
                  <dt>Pages</dt>
                  <dd>{product.bookMetadata.pageCount}</dd>
                </>
              ) : null}
            </dl>
          ) : null}
        </div>
      </div>
    </div>
  );
}
