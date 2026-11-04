import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // generated-site tokens (CSS variables set per website)
        primary: "var(--color-primary)", secondary: "var(--color-secondary)", accent: "var(--color-accent)",
        page: "var(--color-background)", surface: "var(--color-surface)", heading: "var(--color-heading)", body: "var(--color-body)",
        onprimary: "var(--color-button-text)", line: "var(--color-border)", soft: "var(--color-primary-soft)",
      },
    },
  },
  plugins: [],
};
export default config;
