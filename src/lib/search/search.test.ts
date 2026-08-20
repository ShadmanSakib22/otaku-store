import { describe, expect, it, vi } from "vitest";
import { SEARCH_INDEX, SEARCH_REPLICAS } from "@/lib/constants";

vi.stubEnv("ALGOLIA_APP_ID", "test-app");
vi.stubEnv("ALGOLIA_ADMIN_API_KEY", "test-admin-key");
vi.stubEnv("ALGOLIA_SEARCH_API_KEY", "test-search-key");

const { buildFilters, indexForSort } = await import("./search");

describe("buildFilters", () => {
  it("returns undefined when no filters are set", () => {
    expect(buildFilters({ q: "one", page: 1, sort: "relevance" })).toBeUndefined();
  });

  it("filters by product type", () => {
    expect(buildFilters({ q: "", type: "MANGA", page: 1, sort: "relevance" })).toBe(
      'type:"MANGA"'
    );
  });

  it("filters genre/author/publisher by slug", () => {
    const filters = buildFilters({
      q: "",
      genre: "action",
      author: "eiichiro-oda",
      publisher: "shueisha",
      page: 1,
      sort: "relevance",
    });
    expect(filters).toBe(
      'genresSlugs:"action" AND authorsSlugs:"eiichiro-oda" AND publisherSlug:"shueisha"'
    );
  });

  it("maps price bands to numeric filters", () => {
    expect(buildFilters({ q: "", price: "under-500", page: 1, sort: "relevance" })).toBe(
      "price < 500"
    );
    expect(buildFilters({ q: "", price: "500-1000", page: 1, sort: "relevance" })).toBe(
      "price >= 500 AND price <= 1000"
    );
    expect(buildFilters({ q: "", price: "1000-plus", page: 1, sort: "relevance" })).toBe(
      "price > 1000"
    );
  });

  it("combines facet and price filters with AND", () => {
    const filters = buildFilters({
      q: "",
      type: "MANGA",
      price: "under-500",
      page: 1,
      sort: "relevance",
    });
    expect(filters).toBe('type:"MANGA" AND price < 500');
  });
});

describe("indexForSort", () => {
  it("uses the primary index for relevance", () => {
    expect(indexForSort("relevance")).toBe(SEARCH_INDEX);
  });

  it("selects the matching virtual replica for each sort", () => {
    expect(indexForSort("price-asc")).toBe(SEARCH_REPLICAS.priceAsc);
    expect(indexForSort("price-desc")).toBe(SEARCH_REPLICAS.priceDesc);
    expect(indexForSort("newest")).toBe(SEARCH_REPLICAS.newest);
    expect(indexForSort("best-selling")).toBe(SEARCH_REPLICAS.bestSelling);
  });
});