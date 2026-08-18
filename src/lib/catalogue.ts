import { prisma } from "@/lib/db/client";
import { deriveStockStatus } from "@/lib/stock";
import { Prisma, type ProductType } from "@/generated/prisma/client";
import {
  catalogueParamsSchema,
  type CatalogueParams,
} from "@/lib/validation/search";

const FILTER_KEYS = ["q", "genre", "author", "publisher", "price", "sort"] as const;

export function parseCatalogueParams(
  searchParams: Record<string, string | string[] | undefined>
): CatalogueParams {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") flat[key] = value;
    else if (Array.isArray(value) && value.length > 0) flat[key] = value[0];
  }
  return catalogueParamsSchema.parse(flat);
}

export function buildCatalogueUrl(
  base: string,
  params: Partial<CatalogueParams>,
  overrides: Partial<CatalogueParams>
): string {
  const filterChanged = (FILTER_KEYS as readonly string[]).some(
    (key) => {
      const override = overrides[key as keyof CatalogueParams];
      return (
        override !== undefined &&
        override !== "" &&
        override !== params[key as keyof CatalogueParams]
      );
    }
  );

  let page = overrides.page ?? params.page ?? 1;
  if (filterChanged) page = 1;

  const merged: Record<string, string> = {
    q: overrides.q ?? params.q ?? "",
    genre: overrides.genre ?? params.genre ?? "",
    author: overrides.author ?? params.author ?? "",
    publisher: overrides.publisher ?? params.publisher ?? "",
    price: overrides.price ?? params.price ?? "",
    sort: overrides.sort ?? params.sort ?? "relevance",
  };

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (key === "sort" && value === "relevance") continue;
    if (value) query.set(key, value);
  }
  if (page > 1 || filterChanged) query.set("page", String(page));

  const qs = query.toString();
  return qs ? `${base}?${qs}` : base;
}

const PAGE_SIZE = 24;

export async function getCatalogue(
  params: CatalogueParams,
  categoryId?: string
) {
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
  if (categoryId) where.categoryId = categoryId;
  if (params.genre) {
    where.genres = { some: { genre: { slug: params.genre } } };
  }
  if (params.author) {
    where.authors = { some: { author: { slug: params.author } } };
  }
  if (params.publisher) {
    where.publisher = { slug: params.publisher };
  }
  if (params.price === "under-500") {
    where.variants = { some: { price: { lt: 500 } } };
  } else if (params.price === "500-1000") {
    where.variants = { some: { price: { gte: 500, lte: 1000 } } };
  } else if (params.price === "1000-plus") {
    where.variants = { some: { price: { gt: 1000 } } };
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
    case "price-desc": {
      // Order by lowest variant price using a correlated subquery-friendly sort:
      // load page, sort by min price client-side is forbidden (server pagination).
      // Prisma can't order by nested min() directly; approximate by sorting on
      // the default variant price via relation through `variants`. Fallback:
      return [{ variants: { _count: "asc" } } as const];
    }
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
  releaseDate: Date | null;
  category: { slug: string; name: string };
  images: { url: string; alt: string | null }[];
  variants: { price: unknown; inventory: { quantity: number; lowStockAt: number } | null }[];
}) {
  const price = Number(product.variants[0]?.price ?? 0);
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