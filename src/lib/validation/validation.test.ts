import { describe, expect, it } from "vitest";
import { cashCheckoutSchema } from "./checkout";
import { catalogueParamsSchema } from "./search";

describe("cashCheckoutSchema", () => {
  it("rejects missing name", () => {
    const result = cashCheckoutSchema.safeParse({
      phone: "08011112222",
      termsAccepted: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects unaccepted terms", () => {
    const result = cashCheckoutSchema.safeParse({
      name: "Yuki",
      phone: "08011112222",
      termsAccepted: false,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid payload with optional email", () => {
    const result = cashCheckoutSchema.safeParse({
      name: "Yuki",
      phone: "08011112222",
      email: "yuki@example.com",
      termsAccepted: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("catalogueParamsSchema", () => {
  it("parses a full URL query object", () => {
    const result = catalogueParamsSchema.parse({
      q: "one-piece",
      genre: "action",
      sort: "price-asc",
      page: "2",
    });
    expect(result).toMatchObject({
      q: "one-piece",
      genre: "action",
      sort: "price-asc",
      page: 2,
    });
  });

  it("rejects unknown sort", () => {
    expect(() =>
      catalogueParamsSchema.parse({ sort: "bogus" })
    ).toThrow();
  });
});
