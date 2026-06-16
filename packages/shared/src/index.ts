import { z } from "zod";

/**
 * Shared domain types for the CPQ module.
 * These mirror the §6 data model in docs/prd/cpq-module.md and are the single
 * source of truth consumed by the web app, the pricing engine, and (later) billing.
 */

// --- Enums ---------------------------------------------------------------

export const ProductType = z.enum(["one_time", "recurring", "usage"]);
export type ProductType = z.infer<typeof ProductType>;

export const BillingPeriod = z.enum(["monthly", "quarterly", "annual"]);
export type BillingPeriod = z.infer<typeof BillingPeriod>;

export const DiscountType = z.enum(["percent", "fixed"]);
export type DiscountType = z.infer<typeof DiscountType>;

export const QuoteStatus = z.enum([
  "draft",
  "pending_approval",
  "approved",
  "sent",
  "accepted",
  "rejected",
  "expired",
]);
export type QuoteStatus = z.infer<typeof QuoteStatus>;

/** Allowed quote state transitions, enforced server-side (PRD §5.6). */
export const QUOTE_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  draft: ["pending_approval", "approved", "sent"],
  pending_approval: ["approved", "rejected", "draft"],
  approved: ["sent", "draft"],
  sent: ["accepted", "rejected", "expired"],
  accepted: [],
  rejected: [],
  expired: [],
};

// --- Money ---------------------------------------------------------------

/**
 * Money is always represented as integer minor units (cents) — never floats.
 * See PRD §5.4 (deterministic pricing, centralized rounding).
 */
export const Money = z.number().int();
export type Money = number;

// --- Entities ------------------------------------------------------------

export const LineItemInput = z.object({
  productId: z.string(),
  nameSnapshot: z.string(),
  qty: z.number().int().positive(),
  unitPrice: Money, // snapshot at add-time
  discountType: DiscountType,
  discountValue: z.number().nonnegative(), // percent (0-100) or fixed minor units
});
export type LineItemInput = z.infer<typeof LineItemInput>;

export const QuoteInput = z.object({
  accountId: z.string(),
  currency: z.string().length(3).default("USD"),
  lineItems: z.array(LineItemInput),
  quoteDiscountType: DiscountType.optional(),
  quoteDiscountValue: z.number().nonnegative().optional(),
});
export type QuoteInput = z.infer<typeof QuoteInput>;
