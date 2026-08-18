import { describe, expect, it } from "vitest";
import { buildCatalogueUrl, parseCatalogueParams } from "./catalogue";

describe("parseCatalogueParams", () => {
  it("parses and coerces page to number", () => {
    expect(parseCatalogueParams({ page: "3", sort: "newest" }).page).toBe(3);
  });

  it("handles array values by taking the first", () => {
    expect(parseCatalogueParams({ genre: ["action", "comedy"] }).genre).toBe(
      "action"
    );
  });

  it("defaults sort to relevance and page to 1", () => {
    const params = parseCatalogueParams({});
    expect(params.sort).toBe("relevance");
    expect(params.page).toBe(1);
  });
});

describe("buildCatalogueUrl", () => {
  it("preserves query and pagination", () => {
    const url = buildCatalogueUrl(
      "/manga",
      { q: "one", sort: "relevance", page: 1 },
      { q: "one", page: 3 }
    );
    expect(url).toBe("/manga?q=one&page=3");
  });

  it("resets page to 1 when a filter changes", () => {
    const url = buildCatalogueUrl(
      "/manga",
      { q: "one", genre: "action", sort: "relevance", page: 4 },
      { genre: "comedy" }
    );
    expect(url).toBe("/manga?q=one&genre=comedy&page=1");
  });

  it("omits empty values", () => {
    const url = buildCatalogueUrl("/manga", {}, { q: "" });
    expect(url).toBe("/manga");
  });
});