import { describe, expect, it } from "vitest";
import {
  PriceBookCreateInput,
  PriceBookEntryInput,
  ProductCreateInput,
  ProductUpdateInput,
} from "./catalog.js";

describe("ProductCreateInput", () => {
  const base = { name: "Platform", sku: "PLAT-1", type: "one_time" as const };

  it("accepts a valid one-time product and defaults active=true", () => {
    const r = ProductCreateInput.parse(base);
    expect(r.active).toBe(true);
  });

  it("requires a billing period for recurring products", () => {
    const r = ProductCreateInput.safeParse({ ...base, type: "recurring" });
    expect(r.success).toBe(false);
    expect(r.success === false && r.error.issues[0]?.path).toEqual(["billingPeriod"]);
  });

  it("accepts a recurring product with a billing period", () => {
    expect(
      ProductCreateInput.safeParse({ ...base, type: "recurring", billingPeriod: "monthly" })
        .success,
    ).toBe(true);
  });

  it("rejects a billing period on a non-recurring product", () => {
    expect(
      ProductCreateInput.safeParse({ ...base, type: "one_time", billingPeriod: "annual" }).success,
    ).toBe(false);
  });

  it("rejects an invalid SKU", () => {
    expect(ProductCreateInput.safeParse({ ...base, sku: "has space" }).success).toBe(false);
  });
});

describe("ProductUpdateInput", () => {
  it("rejects an empty update", () => {
    expect(ProductUpdateInput.safeParse({}).success).toBe(false);
  });
  it("accepts a partial update", () => {
    expect(ProductUpdateInput.safeParse({ active: false }).success).toBe(true);
  });
});

describe("PriceBookCreateInput", () => {
  it("uppercases the currency and defaults to USD", () => {
    expect(PriceBookCreateInput.parse({ name: "Default" }).currency).toBe("USD");
    expect(PriceBookCreateInput.parse({ name: "EU", currency: "eur" }).currency).toBe("EUR");
  });
});

describe("PriceBookEntryInput", () => {
  it("accepts a non-negative integer list price (minor units)", () => {
    expect(
      PriceBookEntryInput.safeParse({ priceBookId: "pb1", productId: "p1", listPrice: 120000 })
        .success,
    ).toBe(true);
  });
  it("rejects a negative or fractional price", () => {
    expect(
      PriceBookEntryInput.safeParse({ priceBookId: "pb1", productId: "p1", listPrice: -1 }).success,
    ).toBe(false);
    expect(
      PriceBookEntryInput.safeParse({ priceBookId: "pb1", productId: "p1", listPrice: 9.99 })
        .success,
    ).toBe(false);
  });
});
