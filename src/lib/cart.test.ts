import { describe, expect, it } from "vitest";
import { cartTotals } from "./cart";

describe("cartTotals", () => {
  const line = (unitPrice: number, quantity: number) => ({
    variantId: "v",
    sku: "s",
    productId: "p",
    productSlug: "p",
    productName: "P",
    variantName: "V",
    unitPrice,
    quantity,
    image: null,
    stockStatus: "IN_STOCK" as const,
  });

  it("computes subtotal, shipping and total", () => {
    const lines = [line(550, 2), line(7800, 1)];
    const totals = cartTotals(lines);
    expect(totals.subtotal).toBe(8900);
    expect(totals.total).toBe(8900);
  });

  it("adds shipping cost to total", () => {
    const totals = cartTotals([line(500, 1)], 800);
    expect(totals.total).toBe(1300);
  });
});
