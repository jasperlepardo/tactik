import { z } from "zod";
import { BillingPeriod, Money, ProductType } from "./index.js";

/**
 * Catalog & price book input contracts (PRD §5.1–5.2).
 * Shared by the API (validation) and the admin forms (typing). DB-independent.
 */

const sku = z
  .string()
  .trim()
  .min(1, "SKU is required")
  .regex(/^[A-Za-z0-9._-]+$/, "SKU may only contain letters, numbers, . _ -");

export const ProductCreateInput = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    sku,
    description: z.string().trim().optional(),
    type: ProductType,
    /** Required for recurring products; rejected otherwise. */
    billingPeriod: BillingPeriod.optional(),
    /** Unit label for usage products, e.g. "per 1,000 API calls". */
    unitLabel: z.string().trim().optional(),
    active: z.boolean().default(true),
  })
  .superRefine((v, ctx) => {
    if (v.type === "recurring" && !v.billingPeriod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["billingPeriod"],
        message: "Recurring products require a billing period.",
      });
    }
    if (v.type !== "recurring" && v.billingPeriod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["billingPeriod"],
        message: "Only recurring products can have a billing period.",
      });
    }
  });
export type ProductCreateInput = z.infer<typeof ProductCreateInput>;

/** Partial update; same cross-field rules are enforced server-side on the merged entity. */
export const ProductUpdateInput = z
  .object({
    name: z.string().trim().min(1).optional(),
    sku: sku.optional(),
    description: z.string().trim().nullable().optional(),
    type: ProductType.optional(),
    billingPeriod: BillingPeriod.nullable().optional(),
    unitLabel: z.string().trim().nullable().optional(),
    active: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "No fields to update.");
export type ProductUpdateInput = z.infer<typeof ProductUpdateInput>;

export const PriceBookCreateInput = z.object({
  name: z.string().trim().min(1, "Name is required"),
  currency: z.string().trim().length(3, "Use a 3-letter ISO code").toUpperCase().default("USD"),
  isDefault: z.boolean().default(false),
});
export type PriceBookCreateInput = z.infer<typeof PriceBookCreateInput>;

/** A product's list price within a price book. Money is integer minor units (cents). */
export const PriceBookEntryInput = z.object({
  priceBookId: z.string().min(1),
  productId: z.string().min(1),
  listPrice: Money.nonnegative("List price cannot be negative"),
});
export type PriceBookEntryInput = z.infer<typeof PriceBookEntryInput>;
