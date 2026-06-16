/**
 * jspr.config — Tactik's overrides for @jasperlepardo/base-design-system.
 *
 * The consuming repo is the source of truth for theme tokens. Edit overrides
 * here, then regenerate the token CSS:
 *
 *   cd apps/web && npx jspr gen tokens
 *
 * Output lands in `out.css` and is imported by src/app/globals.css.
 * See the override tiers: raw → roles → scale → semantics → components.
 */

// Note: the package exports no config type, so there's no meaningful @type to
// annotate this with. Shape: { raw?, roles?, scale?, semantics?, components?, out?, figma? }.
export default {
  // Role → Tailwind family. These are the design system's DEFAULTS, listed
  // explicitly. Recolors light + dark, since semantics alias
  // {primitive.color.<role>.*}. neutral's white(0)/black(1000) anchors are
  // preserved automatically (base-design-system ≥ 0.4.1).
  roles: {
    primary: "blue",
    neutral: "slate",
    success: "green",
    warning: "amber",
    danger: "red",
    info: "sky",
  },

  // Per-theme semantic overrides would go here, e.g.:
  // semantics: {
  //   light: { primary: { default: 600, hover: 700 } },
  //   dark:  { primary: { default: 400, hover: 300 } },
  // },

  // Shared scale (radius/spacing) overrides:
  // scale: { radius: { md: "{spacing.2}" } },

  out: {
    css: "src/generated",
    ts: "src/generated/ts",
    figma: "src/generated/figma",
  },
};
