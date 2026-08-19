import { describe, expect, it } from "vitest";
import { isFinalized } from "./orders";

describe("isFinalized", () => {
  it("returns false while pending", () => {
    expect(isFinalized({ paymentStatus: "PENDING" })).toBe(false);
  });
  it("returns true when paid", () => {
    expect(isFinalized({ paymentStatus: "PAID" })).toBe(true);
  });
});