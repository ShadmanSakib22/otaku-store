import { prisma } from "@/lib/db/client";
import { deriveStockStatus } from "@/lib/stock";
import { Prisma, type ProductType } from "@/generated/prisma/client";
import {
  FILTER_KEYS,
  parseCatalogueParams,
  buildCatalogueUrl,
  parsePriceRange,
  type CatalogueParams,
} from "./catalogue-url";

export { FILTER_KEYS, parseCatalogueParams, buildCatalogueUrl, parsePriceRange };
export type { CatalogueParams };

const PAGE_SIZE = 24;

export async function getCatalogue(
  params: CatalogueParams,
  categorySlug?: string
) {
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
  if (categorySlug) where.category = { slug: categorySlug };
  if (params.genre) {
    where.genres = { some: { genre: { slug: params.genre } } };
  }
  if (params.author) {
    where.authors = { some: { author: { slug: params.author } } };
  }
  if (params.publisher) {
    where.publisher = { slug: params.publisher };
  }
  const priceRange = parsePriceRange(params.price ?? "");
  if (priceRange.min !== undefined || priceRange.max !== undefined) {
    where.variants = {
      some: {
        price: {
          ...(priceRange.min !== undefined ? { gte: priceRange.min } : {}),
          ...(priceRange.max !== undefined ? { lte: priceRange.max } : {}),
        },
      },
    };
  }

  const orderBy = priceOrderBy(params.sort);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (params.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: true,
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: { include: { inventory: true }, orderBy: { price: "asc" } },
        bookMetadata: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(toProductListItem),
    total,
    currentPage: params.page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

function priceOrderBy(sort: CatalogueParams["sort"]) {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" } as const];
    case "best-selling":
      return [{ lifetimeSales: "desc" } as const];
    case "price-asc":
      return [{ price: "asc" } as const];
    case "price-desc":
      return [{ price: "desc" } as const];
    default:
      return [{ lifetimeSales: "desc" } as const];
  }
}

function toProductListItem(product: {
  id: string;
  slug: string;
  name: string;
  type: ProductType;
  summary: string | null;
  lifetimeSales: number;
  price: Prisma.Decimal;
  releaseDate: Date | null;
  category: { slug: string; name: string };
  images: { url: string; alt: string | null }[];
  variants: { price: unknown; inventory: { quantity: number; lowStockAt: number } | null }[];
}) {
  const price = Number(product.price);
  const inventory = product.variants[0]?.inventory;
  const stockStatus = inventory
    ? deriveStockStatus(inventory.quantity, inventory.lowStockAt)
    : "OUT_OF_STOCK";
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    type: product.type,
    summary: product.summary,
    price,
    stockStatus,
    image: product.images[0]?.url ?? null,
    alt: product.images[0]?.alt ?? product.name,
    categorySlug: product.category.slug,
    lifetimeSales: product.lifetimeSales,
    releaseDate: product.releaseDate,
  };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      publisher: true,
      authors: { include: { author: true } },
      genres: { include: { genre: true } },
      bookMetadata: true,
      images: { orderBy: { position: "asc" } },
      variants: { include: { inventory: true }, orderBy: { price: "asc" } },
    },
  });
}

export async function getFacets() {
  const [genres, authors, publishers] = await Promise.all([
    prisma.genre.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
    prisma.author.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
    prisma.publisher.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return { genres, authors, publishers };
}

export async function getTopSellers(type: ProductType, limit = 8) {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", type },
    orderBy: { lifetimeSales: "desc" },
    take: limit,
    include: {
      category: true,
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { include: { inventory: true }, orderBy: { price: "asc" } },
    },
  });
  return products.map(toProductListItem);
}

export async function getHeroSlides() {
  const now = new Date();
  return prisma.heroSlide.findMany({
    where: {
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    orderBy: { position: "asc" },
  });
}

export async function getSimilarProducts(
  productId: string,
  categorySlug: string,
  limit = 4
) {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      id: { not: productId },
      category: { slug: categorySlug },
    },
    orderBy: { lifetimeSales: "desc" },
    take: limit,
    include: {
      category: true,
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { include: { inventory: true }, orderBy: { price: "asc" } },
    },
  });
  return products.map(toProductListItem);
}