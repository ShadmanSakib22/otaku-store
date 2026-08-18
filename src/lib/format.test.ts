import { describe, expect, it } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("formats JPY without decimals", () => {
    expect(formatPrice(550, "JPY")).toBe("¥550");
  });

  it("formats USD with two decimals", () => {
    expect(formatPrice(12.99, "USD")).toBe("$12.99");
  });
});
