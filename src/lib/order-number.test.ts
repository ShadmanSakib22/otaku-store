import { describe, expect, it } from "vitest";
import { generateOrderNumber } from "./order-number";

describe("generateOrderNumber", () => {
  it("zero-pads the sequence to 6 digits", () => {
    expect(generateOrderNumber(2026, 123)).toBe("ORD-2026-000123");
  });
  it("handles large sequences", () => {
    expect(generateOrderNumber(2026, 999999)).toBe("ORD-2026-999999");
  });
});
