import { describe, expect, it } from "vitest";
import { isIdempotent } from "./webhook";

describe("webhook idempotency", () => {
  it("treats an already-paid order as processed", () => {
    expect(isIdempotent({ paymentStatus: "PAID" })).toBe(true);
  });
  it("allows pending orders to be finalized", () => {
    expect(isIdempotent({ paymentStatus: "PENDING" })).toBe(false);
  });
});