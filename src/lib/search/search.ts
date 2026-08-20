import { searchClient } from "@/lib/search/client";
import { SEARCH_INDEX, SEARCH_REPLICAS } from "@/lib/constants";
import type { CatalogueParams } from "@/lib/validation/search";
import type { ProductListItem } from "@/components/product/product-card";

const PAGE_SIZE = 24;

export function buildFilters(params: Partial<CatalogueParams>): string | undefined {
  const parts: string[] = [];
  if (params.type) parts.push(`type:${JSON.stringify(params.type)}`);
  if (params.genre) parts.push(`genresSlugs:${JSON.stringify(params.genre)}`);
  if (params.author) parts.push(`authorsSlugs:${JSON.stringify(params.author)}`);
  if (params.publisher) parts.push(`publisherSlug:${JSON.stringify(params.publisher)}`);
  if (params.price === "under-500") parts.push("price < 500");
  if (params.price === "500-1000") parts.push("price >= 500 AND price <= 1000");
  if (params.price === "1000-plus") parts.push("price > 1000");
  return parts.length ? parts.join(" AND ") : undefined;
}

export function indexForSort(sort: CatalogueParams["sort"]): string {
  switch (sort) {
    case "price-asc":
      return SEARCH_REPLICAS.priceAsc;
    case "price-desc":
      return SEARCH_REPLICAS.priceDesc;
    case "newest":
      return SEARCH_REPLICAS.newest;
    case "best-selling":
      return SEARCH_REPLICAS.bestSelling;
    default:
      return SEARCH_INDEX;
  }
}

export async function searchProducts(params: CatalogueParams) {
  const result = await searchClient.searchSingleIndex({
    indexName: indexForSort(params.sort),
    searchParams: {
      query: params.q || "",
      filters: buildFilters(params),
      page: params.page - 1,
      hitsPerPage: PAGE_SIZE,
      attributesToRetrieve: [
        "id",
        "name",
        "slug",
        "type",
        "summary",
        "price",
        "lifetimeSales",
        "image",
        "category",
        "stockStatus",
        "releaseDate",
      ],
    },
  });

  const hits = (result.hits as Record<string, unknown>[]).map(toListItem);

  return {
    products: hits,
    total: result.nbSortedHits ?? result.nbHits ?? 0,
    currentPage: params.page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, result.nbPages ?? 1),
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