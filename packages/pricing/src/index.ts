import type { LineItemInput, QuoteInput } from "@tactik/shared";

/**
 * Deterministic CPQ pricing engine (PRD §5.4).
 *
 * Rules:
 *  - All money is integer minor units (cents). No floats stored or returned.
 *  - Fixed order of operations: unit_price × qty → line discount → line subtotal
 *    → sum → quote discount → grand total.
 *  - Centralized rounding: round half-up to the minor unit.
 *  - Pure: output depends only on input. No clock, no I/O, no globals.
 */

/** Round half-up to an integer (minor units). Centralized per PRD §5.4. */
export function roundHalfUp(value: number): number {
  return Math.sign(value) * Math.round(Math.abs(value));
}

export interface PricedLine {
  productId: string;
  qty: number;
  unitPrice: number;
  /** unitPrice × qty, before discount */
  grossAmount: number;
  /** discount applied to this line, in minor units */
  discountAmount: number;
  /** grossAmount − discountAmount */
  lineTotal: number;
}

export interface PricedQuote {
  lines: PricedLine[];
  /** sum of line grossAmounts */
  subtotal: number;
  /** sum of line discounts + quote-level discount */
  discountTotal: number;
  /** subtotal − discountTotal */
  grandTotal: number;
}

function applyDiscount(
  base: number,
  type: "percent" | "fixed",
  value: number,
): number {
  if (value <= 0) return 0;
  const raw = type === "percent" ? (base * value) / 100 : value;
  // never discount below zero
  return Math.min(roundHalfUp(raw), base);
}

export function priceLine(line: LineItemInput): PricedLine {
  const grossAmount = roundHalfUp(line.unitPrice * line.qty);
  const discountAmount = applyDiscount(
    grossAmount,
    line.discountType,
    line.discountValue,
  );
  return {
    productId: line.productId,
    qty: line.qty,
    unitPrice: line.unitPrice,
    grossAmount,
    discountAmount,
    lineTotal: grossAmount - discountAmount,
  };
}

export function priceQuote(quote: QuoteInput): PricedQuote {
  const lines = quote.lineItems.map(priceLine);

  const subtotal = lines.reduce((sum, l) => sum + l.grossAmount, 0);
  const lineDiscounts = lines.reduce((sum, l) => sum + l.discountAmount, 0);
  const lineTotalSum = subtotal - lineDiscounts;

  const quoteDiscount =
    quote.quoteDiscountType && quote.quoteDiscountValue
      ? applyDiscount(
          lineTotalSum,
          quote.quoteDiscountType,
          quote.quoteDiscountValue,
        )
      : 0;

  return {
    lines,
    subtotal,
    discountTotal: lineDiscounts + quoteDiscount,
    grandTotal: lineTotalSum - quoteDiscount,
  };
}

/** Effective total discount as a fraction of subtotal — used by approval rules (PRD §5.5). */
export function effectiveDiscountPct(priced: PricedQuote): number {
  if (priced.subtotal === 0) return 0;
  return priced.discountTotal / priced.subtotal;
}
