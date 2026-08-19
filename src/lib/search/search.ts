import { searchClient } from "@/lib/search/client";
import { SEARCH_INDEX } from "@/lib/constants";
import type { CatalogueParams } from "@/lib/validation/search";
import type { ProductListItem } from "@/components/product/product-card";

const PAGE_SIZE = 24;

export async function searchProducts(params: CatalogueParams) {
  const filters: string[] = [];
  if (params.type) filters.push(`type = ${params.type}`);
  if (params.genre) filters.push(`genres = ${JSON.stringify(params.genre)}`);
  if (params.author) filters.push(`authors = ${JSON.stringify(params.author)}`);
  if (params.publisher) filters.push(`publisher = ${JSON.stringify(params.publisher)}`);
  if (params.price === "under-500") filters.push("price < 500");
  if (params.price === "500-1000") filters.push("price >= 500 AND price <= 1000");
  if (params.price === "1000-plus") filters.push("price > 1000");

  const sort = {
    "price-asc": ["price:asc"],
    "price-desc": ["price:desc"],
    "best-selling": ["lifetimeSales:desc"],
    newest: ["createdAt:desc"],
    relevance: [],
  }[params.sort] ?? [];

  const result = await searchClient.index(SEARCH_INDEX).search(
    params.q || "",
    {
      filter: filters.length ? filters.join(" AND ") : undefined,
      sort,
      offset: (params.page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
      attributesToRetrieve: ["id", "name", "slug", "type", "summary", "price", "lifetimeSales", "image", "category", "stockStatus", "releaseDate"],
    }
  );

  const hits = (result.hits as Record<string, unknown>[]).map(toListItem);

  return {
    products: hits,
    total: result.estimatedTotalHits ?? 0,
    currentPage: params.page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil((result.estimatedTotalHits ?? 0) / PAGE_SIZE)),
  };
}

function toListItem(hit: Record<string, unknown>): ProductListItem {
  return {
    id: String(hit.id),
    slug: String(hit.slug),
    name: String(hit.name),
    type: String(hit.type),
    summary: hit.summary ? String(hit.summary) : null,
    price: Number(hit.price),
    stockStatus: (hit.stockStatus as ProductListItem["stockStatus"]) ?? "IN_STOCK",
    image: hit.image ? String(hit.image) : null,
    alt: String(hit.name),
    categorySlug: String(hit.category ?? ""),
    lifetimeSales: Number(hit.lifetimeSales ?? 0),
    releaseDate: hit.releaseDate ? new Date(String(hit.releaseDate)) : null,
  };
}