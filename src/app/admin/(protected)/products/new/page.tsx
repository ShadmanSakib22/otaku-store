import { prisma } from "@/lib/db/client";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const [categories, publishers, genres, authors] = await Promise.all([
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.publisher.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.genre.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.author.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">New Product</h1>
      <ProductForm categories={categories} publishers={publishers} genres={genres} authors={authors} />
    </div>
  );
}
