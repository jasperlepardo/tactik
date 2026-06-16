import type { Metadata } from "next";
import { themeScript } from "@jasperlepardo/base-design-system";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tactik CPQ",
  description: "Configure, Price, Quote — Tactik Revenue Lifecycle Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // No hardcoded data-theme: absence = follow OS (design system default).
    // themeScript (below) applies the persisted theme before first paint.
    // suppressHydrationWarning is required because that script mutates <html>
    // before React hydrates — see docs/prd notes on §7.1 theming.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Must run before paint to avoid a flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
