import { describe, expect, it } from "vitest";
import {
  effectiveDiscountPct,
  priceLine,
  priceQuote,
  roundHalfUp,
} from "./index.js";

describe("roundHalfUp", () => {
  it("rounds half up symmetrically", () => {
    expect(roundHalfUp(0.5)).toBe(1);
    expect(roundHalfUp(1.5)).toBe(2);
    expect(roundHalfUp(-0.5)).toBe(-1);
    expect(roundHalfUp(2.4)).toBe(2);
  });
});

describe("priceLine", () => {
  it("computes gross and line total with no discount", () => {
    const line = priceLine({
      productId: "p1",
      nameSnapshot: "Widget",
      qty: 3,
      unitPrice: 1000, // $10.00
      discountType: "percent",
      discountValue: 0,
    });
    expect(line.grossAmount).toBe(3000);
    expect(line.discountAmount).toBe(0);
    expect(line.lineTotal).toBe(3000);
  });

  it("applies a percent discount", () => {
    const line = priceLine({
      productId: "p1",
      nameSnapshot: "Widget",
      qty: 2,
      unitPrice: 1000,
      discountType: "percent",
      discountValue: 10,
    });
    expect(line.grossAmount).toBe(2000);
    expect(line.discountAmount).toBe(200);
    expect(line.lineTotal).toBe(1800);
  });

  it("caps a fixed discount at the gross amount (never negative)", () => {
    const line = priceLine({
      productId: "p1",
      nameSnapshot: "Widget",
      qty: 1,
      unitPrice: 500,
      discountType: "fixed",
      discountValue: 9999,
    });
    expect(line.discountAmount).toBe(500);
    expect(line.lineTotal).toBe(0);
  });
});

describe("priceQuote", () => {
  it("sums lines and applies a quote-level discount last", () => {
    const priced = priceQuote({
      accountId: "a1",
      currency: "USD",
      lineItems: [
        {
          productId: "p1",
          nameSnapshot: "A",
          qty: 1,
          unitPrice: 10000,
          discountType: "percent",
          discountValue: 0,
        },
        {
          productId: "p2",
          nameSnapshot: "B",
          qty: 2,
          unitPrice: 5000,
          discountType: "fixed",
          discountValue: 1000,
        },
      ],
      quoteDiscountType: "percent",
      quoteDiscountValue: 10,
    });

    // subtotal = 10000 + 10000 = 20000
    expect(priced.subtotal).toBe(20000);
    // line discounts = 0 + 1000 = 1000; lineTotalSum = 19000
    // quote discount = 10% of 19000 = 1900
    expect(priced.discountTotal).toBe(2900);
    expect(priced.grandTotal).toBe(17100);
  });

  it("handles an empty quote", () => {
    const priced = priceQuote({ accountId: "a1", currency: "USD", lineItems: [] });
    expect(priced.subtotal).toBe(0);
    expect(priced.grandTotal).toBe(0);
    expect(effectiveDiscountPct(priced)).toBe(0);
  });

  it("reports effective discount percent for approval rules", () => {
    const priced = priceQuote({
      accountId: "a1",
      currency: "USD",
      lineItems: [
        {
          productId: "p1",
          nameSnapshot: "A",
          qty: 1,
          unitPrice: 10000,
          discountType: "percent",
          discountValue: 20,
        },
      ],
    });
    expect(effectiveDiscountPct(priced)).toBeCloseTo(0.2, 5);
  });
});
