import { describe, expect, it } from "vitest";
import { buildProductDocument } from "./documents";

function productFixture() {
  return {
    id: "p1",
    name: "One Piece Vol. 1",
    slug: "one-piece-volume-1",
    type: "MANGA" as const,
    lifetimeSales: 1248,
    releaseDate: new Date("1997-07-19"),
    createdAt: new Date("2026-01-01"),
    summary: "A pirate adventure",
    description: "The adventures of Monkey D. Luffy.",
    category: { name: "Manga", slug: "manga" },
    publisher: { name: "Shueisha", slug: "shueisha" },
    authors: [{ author: { name: "Eiichiro Oda", slug: "eiichiro-oda" } }],
    genres: [
      { genre: { name: "Action", slug: "action" } },
      { genre: { name: "Comedy", slug: "comedy" } },
    ],
    images: [{ url: "https://img/x.jpg", alt: "One Piece Vol. 1" }],
    variants: [{ price: 12.99, inventory: { quantity: 5, lowStockAt: 3 } }],
  };
}

describe("buildProductDocument", () => {
  it("uses product id as the Algolia objectID", () => {
    const doc = buildProductDocument(productFixture());
    expect(doc.objectID).toBe("p1");
    expect(doc.id).toBe("p1");
  });

  it("stores genre and author slugs for faceting, names for search", () => {
    const doc = buildProductDocument(productFixture());
    expect(doc.genresSlugs).toEqual(["action", "comedy"]);
    expect(doc.genres).toEqual(["Action", "Comedy"]);
    expect(doc.authorsSlugs).toEqual(["eiichiro-oda"]);
    expect(doc.authors).toEqual(["Eiichiro Oda"]);
    expect(doc.publisherSlug).toBe("shueisha");
    expect(doc.publisher).toBe("Shueisha");
  });

  it("derives stock status from the first variant inventory", () => {
    const inStock = buildProductDocument(productFixture());
    expect(inStock.stockStatus).toBe("IN_STOCK");

    const noInventory = buildProductDocument({
      ...productFixture(),
      variants: [{ price: 12.99, inventory: null }],
    });
    expect(noInventory.stockStatus).toBe("OUT_OF_STOCK");
  });

  it("serializes dates to ISO strings", () => {
    const doc = buildProductDocument(productFixture());
    expect(doc.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(doc.releaseDate).toBe("1997-07-19T00:00:00.000Z");
  });
});