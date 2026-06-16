# PRD — CPQ Module (v1 MVP)

**Product:** Tactik — Revenue Lifecycle Management (RLM) platform
**Module:** CPQ (Configure, Price, Quote)
**Status:** Draft
**Author:** Jasper Lepardo
**Last updated:** 2026-06-16
**Scope:** Lean MVP (v1). AI-assist features are explicitly out of scope for v1 and described as a future phase.

---

## 1. Summary

The CPQ module lets a sales rep assemble a priced, accurate, approval-compliant quote for a customer in minutes instead of hours of spreadsheet work. It is the front door of Tactik's Revenue Lifecycle Platform: the quote a rep builds here becomes the source of truth that flows downstream into billing and revenue intelligence on a single shared data model.

v1 deliberately targets the **80% common path**: a catalog of products with list prices, a quote builder that supports line items and simple discounts, a lightweight approval step for discounts over a threshold, and a clean quote output (web view + PDF). Complex configuration logic, usage/ramp pricing automation, and AI assistance are deferred to later phases (Section 11).

## 2. Goals & non-goals

### Goals (v1)
- A rep can build a multi-line quote from a product catalog and send it to a customer.
- Pricing is deterministic and auditable — every line's price, discount, and total is traceable.
- Discounts beyond a configurable threshold require manager approval before the quote can be sent.
- A quote is a structured, durable record (not a document) so downstream RLM modules can consume it.
- Quotes render as a shareable web link and an exportable PDF.

### Non-goals (v1)
- AI-driven quoting, pricing suggestions, or deal-desk copilot (future phase — see §11).
- Complex product configuration (dependency rules, exclusions, guided selling trees).
- Native usage-based / ramped pricing automation (model the data, but v1 enters these as manual line items).
- E-signature integration.
- Direct CRM (Salesforce/HubSpot) bidirectional sync.
- Multi-currency and tax calculation (single currency, tax-exclusive in v1).
- Automated handoff to billing (define the contract/boundary, but execution is a later phase).

## 3. Personas

| Persona | Need from CPQ |
|---|---|
| **Sales Rep (primary)** | Build and send an accurate quote fast; not get blocked. |
| **Sales Manager / Deal Desk** | Approve discounts; enforce guardrails; see what's in flight. |
| **RevOps / Admin** | Manage product catalog, price book, and discount/approval rules. |
| **Customer (recipient)** | View a clear, professional quote; accept it. |

## 4. Key user stories

1. As a **rep**, I can browse the product catalog and add products to a quote as line items with quantity.
2. As a **rep**, I can apply a percentage or fixed-amount discount to a line or to the whole quote.
3. As a **rep**, I see the quote subtotal, discount, and total update live as I edit.
4. As a **rep**, when my discount exceeds the policy threshold, I submit the quote for approval and am told who must approve.
5. As a **manager**, I see a queue of quotes awaiting my approval and can approve or reject with a comment.
6. As a **rep**, once approved, I can generate a shareable quote link and a PDF and mark the quote as Sent.
7. As a **customer**, I open the quote link and see line items, pricing, validity date, and terms.
8. As an **admin**, I can create/edit products, set list prices in a price book, and configure the discount approval threshold.

## 5. Functional requirements

### 5.1 Product catalog
- CRUD for **Products**: name, SKU, description, product type (`one_time`, `recurring`, `usage`), active flag.
- Recurring products have a billing period (`monthly`, `quarterly`, `annual`).
- `usage`-type products carry a unit label (e.g., "per 1,000 API calls") but v1 does **not** auto-meter — price is entered manually on the quote.
- Products belong to one or more **Price Books**; v1 ships a single default price book.

### 5.2 Price book
- A price book maps a product → a list price (single currency, e.g. USD).
- Admins edit list prices. Price changes do **not** retroactively alter existing quotes (quotes snapshot price at add-time).

### 5.3 Quote builder
- Create a quote tied to an **Account** (minimal: name + optional external ref) and an owner (rep).
- Add/remove/reorder **line items**; each line: product, quantity, unit price (defaults from price book, editable with permission), discount, line total.
- **Discounts:** per-line and quote-level, as percent or fixed amount. Quote-level discount distributes across lines for reporting but is stored explicitly.
- Live totals: subtotal, total discount, grand total, and (for recurring lines) an annualized/MRR summary.
- **Quote validity:** an expiration date (default configurable, e.g. 30 days).
- Quotes are versioned: editing a Sent quote creates a new version; prior versions are read-only.

### 5.4 Pricing engine (deterministic)
- A single pure function computes line and quote totals from inputs. No hidden state.
- Order of operations is fixed and documented: `unit_price × qty → line discount → line subtotal → sum → quote discount → grand total`.
- Every computed value is reproducible from the stored quote inputs (auditability requirement).
- Rounding rule defined and centralized (round half-up to 2 decimals).

### 5.5 Approvals
- Admin sets a **discount threshold** (e.g., > 15% total discount requires approval).
- When a quote exceeds the threshold, it cannot move to `Sent` until approved.
- Approval request routes to a designated approver role; approver sees the quote and can **approve** or **reject + comment**.
- All approval actions are recorded in the quote's audit trail.

### 5.6 Quote lifecycle (states)
`Draft → (Pending Approval) → Approved → Sent → Accepted / Rejected / Expired`
- Allowed transitions are enforced server-side.
- `Pending Approval` is skipped when no rule is triggered.
- `Expired` is set automatically past the validity date.

### 5.7 Quote output
- **Web view:** shareable, tokenized read-only link (no login required for the customer).
- **PDF export:** server-rendered, branded, matching the web view.
- Output includes: company/customer info, line items, pricing breakdown, total, validity date, and terms text (admin-configurable).

### 5.8 Audit trail
- Append-only log per quote: created, edited (field-level deltas), submitted, approved/rejected, sent, viewed by customer, accepted.

### 5.9 Permissions (roles)
- `rep` (own quotes), `manager` (approve + team visibility), `admin` (catalog, price book, rules), `viewer`.
- Unit-price override and quote-level discount above threshold gated by role.

## 6. Data model (entities)

> Designed to live on Tactik's single RLM data model so billing/intelligence can read the same records.

- **Account** — id, name, external_ref, created_at.
- **Product** — id, name, sku, description, type, billing_period?, unit_label?, active.
- **PriceBook** — id, name, currency, is_default.
- **PriceBookEntry** — id, price_book_id, product_id, list_price.
- **Quote** — id, account_id, owner_id, status, version, parent_quote_id?, currency, valid_until, terms, totals (subtotal, discount_total, grand_total), created_at, sent_at.
- **QuoteLineItem** — id, quote_id, product_id, name_snapshot, qty, unit_price_snapshot, discount_type, discount_value, line_total, sort_order.
- **ApprovalRule** — id, name, condition (e.g. `discount_pct > 0.15`), approver_role, active.
- **ApprovalRequest** — id, quote_id, rule_id, status, approver_id?, decided_at, comment.
- **AuditEvent** — id, quote_id, actor_id, type, payload (json), created_at.

**Downstream contract (boundary, not built in v1):** an Accepted Quote is the canonical input to the Billing module. v1 freezes the Quote/QuoteLineItem shape so a later billing handoff is a read, not a re-model.

## 7. Recommended tech stack

Chosen for a single-data-model RLM platform, type-safety end-to-end, and a small team moving fast.

| Layer | Recommendation | Why |
|---|---|---|
| **Language** | TypeScript (strict) everywhere | One language across web + API; shared types for the data model. |
| **Frontend** | Next.js (App Router) + React | SSR for fast quote views, file-based routing, mature ecosystem. |
| **UI / design system** | **`@jasperlepardo/base-design-system`** (React + Tailwind v4, token-driven, light/dark theming, Figma-synced) | Reuse the existing in-house design system as the single source of UI truth instead of a generic kit. |
| **UI gap-fill** | Headless primitives (e.g. Radix) styled to design-system tokens, **or** extend the design system | The design system covers atoms today; CPQ needs composite components (tables, dialogs, selects, date pickers) — see §7.1. |
| **API** | Next.js Route Handlers / tRPC (or REST) | Co-located, typed client-server contract; tRPC removes API drift. |
| **DB** | PostgreSQL | Relational integrity for money/quotes; the right model for a shared RLM data model. |
| **ORM** | Prisma (or Drizzle) | Typed schema = the data model in §6; migrations first-class. |
| **PDF** | React-PDF or a headless-Chromium render of the web view | Reuse the web quote layout for the PDF; one source of truth. |
| **Auth** | Auth.js (NextAuth) or Clerk | Roles/permissions in §5.9; customer quote links are tokenized & unauthenticated. |
| **Money** | Integer minor units (cents) + a decimal/money library | Never use floats for currency; centralize rounding (§5.4). |
| **Background jobs** | A queue (e.g. BullMQ) or scheduled task | Expiry sweeps, PDF generation, email send. |
| **Hosting** | Vercel (web) + managed Postgres (Neon/Supabase/RDS) | Low-ops start; portable later. |
| **Testing** | Vitest (unit, esp. pricing engine) + Playwright (E2E) | The pricing engine must be exhaustively unit-tested. |

**Repo shape (monorepo-ready):** `apps/web`, `packages/db` (schema + migrations), `packages/pricing` (the pure pricing engine), `packages/shared` (types). This keeps the pricing engine isolated and reusable by future billing/intelligence modules.

### 7.1 Design system adoption (`@jasperlepardo/base-design-system`)

The CPQ UI is built on the existing in-house design system rather than a generic component kit.

**Setup**
- The system publishes to **GitHub Packages** (`@jasperlepardo/base-design-system`). The app and **all CI/CD runners** need a `GITHUB_TOKEN` and a scoped `.npmrc` to install. Document this in the repo README and CI secrets.
- Adopt its token pipeline (raw → primitives → semantics → components) and `data-theme` light/dark theming from day one so CPQ inherits consistent styling.

**App Router compatibility**
- Verify components render under Next.js App Router; interactive components are client components and need `"use client"`. Run a smoke test in M2 before building the quote builder.

**Component coverage**
- **Available today (use directly):** Button, Text, Icon, Link, Badge, Card (+ Header/Title/Body/Footer), Alert, TextField, FormField, FormLabel.
- **Needed by CPQ but not yet in the system (gap):** data table, dialog/modal, dropdown/select, combobox, date picker, toast/notifications, tabs.
- **Decision:** prefer **extending the design system** to add the missing composites (keeps one source of truth and feeds Figma sync); fall back to headless primitives (Radix) styled to design-system tokens where speed matters. Track which path is taken per component.

**Figma sync**
- The design system's bidirectional Figma sync keeps CPQ screens aligned between design and code — useful for the quote builder and customer-facing quote view.

## 8. UX flows (high level)

1. **Build quote:** New Quote → pick/create Account → add line items from catalog → adjust qty/price/discount → review live totals.
2. **Approval (conditional):** Submit → system evaluates rules → if triggered, status `Pending Approval` + notify approver → approver decides → rep notified.
3. **Send:** Approved (or no-approval-needed) → Generate link + PDF → status `Sent` → customer opens (logged) → Accept/Reject.
4. **Admin:** Manage catalog → manage price book → set discount threshold/terms.

## 9. Success metrics

- **Time-to-quote:** median time from New Quote → Sent (target: < 10 min for a standard 3–5 line deal).
- **Quote accuracy:** % of sent quotes with zero post-send pricing corrections (target: > 95%).
- **Approval cycle time:** median Pending Approval → decision (target: < 4 business hours).
- **Adoption:** % of deals quoted in Tactik vs. spreadsheets.
- **Acceptance rate:** % of sent quotes marked Accepted (baseline to track, not a v1 gate).

## 10. Open questions / assumptions

- **Currency/tax:** v1 assumes single currency, tax-exclusive. Confirm acceptable for first customers.
- **Email delivery:** does v1 send quote emails from Tactik, or does the rep copy a link? (Assumed: copy link + optional email.)
- **Approval routing:** single approver role in v1, or named-manager hierarchy? (Assumed: role-based, single level.)
- **Customer accounts:** are accounts shared with a CRM or Tactik-native? (Assumed: Tactik-native minimal record in v1.)
- **Terms/legal:** is admin free-text terms sufficient, or are templated clauses needed? (Assumed: free-text.)

## 11. Future phases (post-v1)

- **Phase 2 — Configuration:** product bundles, dependency/exclusion rules, guided selling.
- **Phase 3 — Advanced pricing:** native usage-based metering, ramp/tiered pricing schedules, volume tiers, multi-currency + tax.
- **Phase 4 — Billing handoff:** automated Accepted Quote → Billing schedule generation on the shared data model.
- **Phase 5 — AI assist (deferred from v1):** guided configuration, discount/price recommendations from historical win data, a deal-desk copilot, and quote anomaly detection. This is where the RLM "AI agents that draw on the full lifecycle" thesis lands — it depends on having real quote + billing history first, which is why it comes after the fundamentals.
- **Phase 6 — Integrations:** Salesforce/HubSpot sync, e-signature, accounting export.

## 12. Rollout / milestones (v1)

1. **M1 — Data model + pricing engine:** schema (§6), pure pricing package (§5.4) with exhaustive unit tests.
2. **M2 — Catalog & price book:** admin CRUD + default price book.
3. **M3 — Quote builder:** line items, discounts, live totals, lifecycle states.
4. **M4 — Approvals:** rules engine + approval queue + audit trail.
5. **M5 — Output:** web quote view + PDF + tokenized link + customer accept/reject.
6. **M6 — Hardening:** permissions, expiry job, E2E tests, polish.
