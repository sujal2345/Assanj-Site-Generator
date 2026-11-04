import type { ColorKey } from "./schema";
import { contrastRatio, readableOn, isLight } from "./color";
import type { SiteConfig } from "./schema";

export type Palette = Record<ColorKey, string>;
export const THEME_PRESETS: { name: string; colors: Palette }[] = [
  { name: "Solar Green", colors: { primary: "#087a55", secondary: "#064b39", accent: "#d5bd57", background: "#ffffff", surface: "#f5f7f5", heading: "#101c18", body: "#53615b", buttonText: "#ffffff", border: "#e0e6e2", navbar: "#ffffff", footer: "#061e18" } },
  { name: "Emerald and White", colors: { primary: "#059669", secondary: "#065f46", accent: "#34d399", background: "#ffffff", surface: "#ecfdf5", heading: "#022c22", body: "#3f4f4a", buttonText: "#ffffff", border: "#d1fae5", navbar: "#ffffff", footer: "#f0fdf4" } },
  { name: "Blue and White", colors: { primary: "#2563eb", secondary: "#1e3a8a", accent: "#38bdf8", background: "#ffffff", surface: "#eff6ff", heading: "#0f172a", body: "#475569", buttonText: "#ffffff", border: "#dbeafe", navbar: "#ffffff", footer: "#f8fafc" } },
  { name: "Premium Black and Gold", colors: { primary: "#c9a227", secondary: "#111111", accent: "#e5c158", background: "#0b0b0b", surface: "#151515", heading: "#f8f5ec", body: "#b9b4a6", buttonText: "#111111", border: "#2a2a2a", navbar: "#0b0b0b", footer: "#070707" } },
  { name: "Orange and Charcoal", colors: { primary: "#ea580c", secondary: "#27272a", accent: "#fbbf24", background: "#ffffff", surface: "#fff7ed", heading: "#1c1917", body: "#57534e", buttonText: "#ffffff", border: "#fde4cf", navbar: "#ffffff", footer: "#27272a" } },
  { name: "Clean Blue Energy", colors: { primary: "#0284c7", secondary: "#0c4a6e", accent: "#f59e0b", background: "#ffffff", surface: "#f0f9ff", heading: "#082f49", body: "#475569", buttonText: "#ffffff", border: "#e0f2fe", navbar: "#ffffff", footer: "#f0f9ff" } },
];

export const FONT_OPTIONS = ["Inter", "Poppins", "Montserrat", "DM Sans", "Manrope", "Outfit", "Plus Jakarta Sans", "Nunito", "Open Sans", "Playfair Display", "Lora"];

export function fontHref(...fonts: string[]) {
  const uniq = Array.from(new Set(fonts.filter(Boolean)));
  return `https://fonts.googleapis.com/css2?${uniq.map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700`).join("&")}&display=swap`;
}

const SPACING = { compact: "3.25rem", comfortable: "4.75rem", spacious: "6.5rem" } as const;
const BTN_RADIUS = { square: "4px", rounded: "10px", pill: "999px" } as const;

/** Centralized design tokens -> CSS custom properties. Every site component reads these, never raw colors. */
export function themeToCssVars(c: Pick<SiteConfig, "theme" | "layout">): Record<string, string> {
  const { colors: k, typography: t } = c.theme;
  const l = c.layout;
  const mix = (col: string, pct: number) => `color-mix(in srgb, ${col} ${pct}%, transparent)`;
  const navText = readableOn(k.navbar);
  const footText = readableOn(k.footer);
  return {
    "--color-primary": k.primary, "--color-secondary": k.secondary, "--color-accent": k.accent,
    "--color-background": k.background, "--color-surface": k.surface, "--color-heading": k.heading, "--color-body": k.body,
    "--color-button-text": k.buttonText, "--color-border": k.border, "--color-navbar": k.navbar, "--color-footer": k.footer,
    "--color-primary-soft": mix(k.primary, 12), "--color-primary-hover": `color-mix(in srgb, ${k.primary} 86%, black)`,
    "--color-navbar-text": navText, "--color-footer-text": footText,
    "--color-footer-muted": isLight(k.footer) ? "#4b5563" : "#cbd5e1",
    "--font-heading": `"${t.headingFont}", system-ui, sans-serif`, "--font-body": `"${t.bodyFont}", system-ui, sans-serif`,
    "--h-weight": t.headingWeight, "--base-size": `${t.baseSize}px`, "--h-scale": String(t.headingScale),
    "--radius": `${t.radius}px`, "--img-radius": `${l.imageRadius}px`, "--btn-radius": BTN_RADIUS[l.buttonShape],
    "--max-w": `${l.maxWidth}px`, "--section-y": SPACING[l.sectionSpacing],
  };
}

export function contrastWarnings(colors: Palette) {
  const pairs: [string, ColorKey, ColorKey][] = [
    ["Heading on background", "heading", "background"], ["Body text on background", "body", "background"],
    ["Body text on alternate background", "body", "surface"], ["Heading on alternate background", "heading", "surface"],
    ["Button text on primary", "buttonText", "primary"],
  ];
  return pairs
    .map(([label, a, b]) => ({ label, ratio: contrastRatio(colors[a], colors[b]) }))
    .filter((p) => p.ratio < 4.5);
}
