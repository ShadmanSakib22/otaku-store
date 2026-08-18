import { describe, expect, it } from "vitest";
import { deriveStockStatus } from "./stock";

describe("deriveStockStatus", () => {
  it("is OUT_OF_STOCK at zero", () => {
    expect(deriveStockStatus(0, 5)).toBe("OUT_OF_STOCK");
  });
  it("is LOW_STOCK at or below threshold", () => {
    expect(deriveStockStatus(5, 5)).toBe("LOW_STOCK");
  });
  it("is IN_STOCK above threshold", () => {
    expect(deriveStockStatus(6, 5)).toBe("IN_STOCK");
  });
});
