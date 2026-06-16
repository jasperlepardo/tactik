"use client";

import { useEffect, useState } from "react";
import { Button, useTheme, type ThemeMode } from "@jasperlepardo/base-design-system";

const ORDER: ThemeMode[] = ["light", "dark", "system"];
const LABEL: Record<ThemeMode, string> = {
  light: "☀️ Light",
  dark: "🌙 Dark",
  system: "🖥️ System",
};

/**
 * Cycles light → dark → system using the design system's theme controls.
 * setMode persists to localStorage; themeScript (in layout) re-applies it on next load.
 *
 * The label/title reflect localStorage, which doesn't exist on the server — so we
 * render the SSR-stable "system" value until mounted, then switch to the real mode.
 * This avoids a hydration mismatch (the actual theme colors are already correct
 * pre-paint via themeScript; only this control's label catches up after mount).
 */
export function ThemeToggle() {
  const [mode, setMode, resolved] = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length] ?? "system";

  return (
    <Button
      onClick={() => setMode(next)}
      title={mounted ? `Resolved: ${resolved}` : undefined}
    >
      {mounted ? LABEL[mode] : LABEL.system}
    </Button>
  );
}
