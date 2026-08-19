import type { ProductType } from "@/generated/prisma/client";
import { deriveStockStatus } from "@/lib/stock";

export interface ProductDocument {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  description: string;
  releaseDate: string | null;
  type: ProductType;
  category: string;
  authors: string[];
  publisher: string | null;
  genres: string[];
  price: number;
  lifetimeSales: number;
  stockStatus: string;
  image: string | null;
  createdAt: string;
}

export function buildProductDocument(product: {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  lifetimeSales: number;
  releaseDate: Date | null;
  createdAt: Date;
  summary: string | null;
  description: string;
  category: { name: string };
  publisher: { name: string } | null;
  authors: { author: { name: string } }[];
  genres: { genre: { name: string } }[];
  images: { url: string; alt: string | null }[];
  variants: { price: unknown; inventory: { quantity: number; lowStockAt: number } | null }[];
}): ProductDocument {
  const price = Number(product.variants[0]?.price ?? 0);
  const inventory = product.variants[0]?.inventory;
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    summary: product.summary,
    description: product.description,
    releaseDate: product.releaseDate ? product.releaseDate.toISOString() : null,
    type: product.type,
    category: product.category.name,
    authors: product.authors.map((a) => a.author.name),
    publisher: product.publisher?.name ?? null,
    genres: product.genres.map((g) => g.genre.name),
    price,
    lifetimeSales: product.lifetimeSales,
    stockStatus: inventory
      ? deriveStockStatus(inventory.quantity, inventory.lowStockAt)
      : "OUT_OF_STOCK",
    image: product.images[0]?.url ?? null,
    createdAt: product.createdAt.toISOString(),
  };
}