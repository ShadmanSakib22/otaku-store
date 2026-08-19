import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { getProductBySlug } from "@/lib/catalogue";
import { ProductForm } from "@/components/admin/product-form";
import type { ProductFormValues } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { slug: true } });

  if (!product) notFound();

  const [data, categories, publishers, genres, authors] = await Promise.all([
    getProductBySlug(product.slug),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.publisher.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.genre.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.author.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!data) notFound();

  const initial: ProductFormValues = {
    id: data.id,
    name: data.name,
    slug: data.slug,
    type: data.type,
    status: data.status,
    summary: data.summary ?? "",
    description: data.description,
    categoryId: data.categoryId,
    publisherId: data.publisherId ?? "",
    releaseDate: data.releaseDate ? data.releaseDate.toISOString().slice(0, 10) : "",
    genres: data.genres.map((g) => g.genreId),
    authors: data.authors.map((a) => a.authorId),
    imageUrls: data.images.map((img) => img.url),
    volume: data.bookMetadata?.volume,
    isbn: data.bookMetadata?.isbn ?? "",
    language: data.bookMetadata?.language ?? "Japanese",
    pageCount: data.bookMetadata?.pageCount ?? undefined,
    variants: data.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: String(v.price),
      size: v.size ?? "",
      color: v.color ?? "",
      stock: String(v.inventory?.quantity ?? 0),
      lowStockAt: String(v.inventory?.lowStockAt ?? 5),
    })),
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Edit Product</h1>
      <ProductForm categories={categories} publishers={publishers} genres={genres} authors={authors} initial={initial} />
    </div>
  );
}
