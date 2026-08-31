import type { Config } from "tailwindcss";

/**
 * Token'lar Stitch design system'inden ("Nisa Ayakkabı Soft Luxury") alındı.
 * Kaynak: design/stitch/*.html içindeki <script id="tailwind-config"> bloğu.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#faf9f6",
        "on-background": "#1a1c1a",

        surface: "#faf9f6",
        "surface-dim": "#dbdad7",
        "surface-bright": "#faf9f6",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f4f3f1",
        "surface-container": "#efeeeb",
        "surface-container-high": "#e9e8e5",
        "surface-container-highest": "#e3e2e0",
        "surface-variant": "#e3e2e0",
        "surface-tint": "#755a25",
        "on-surface": "#1a1c1a",
        "on-surface-variant": "#4d463a",
        "inverse-surface": "#2f312f",
        "inverse-on-surface": "#f2f1ee",

        outline: "#7f7668",
        "outline-variant": "#d1c5b5",

        primary: "#755a25",
        "on-primary": "#ffffff",
        "primary-container": "#c5a367",
        "on-primary-container": "#503906",
        "inverse-primary": "#e6c182",
        "primary-fixed": "#ffdea7",
        "primary-fixed-dim": "#e6c182",
        "on-primary-fixed": "#271900",
        "on-primary-fixed-variant": "#5b430f",

        secondary: "#5d5f5b",
        "on-secondary": "#ffffff",
        "secondary-container": "#e0e0db",
        "on-secondary-container": "#62635f",
        "secondary-fixed": "#e3e3de",
        "secondary-fixed-dim": "#c6c7c2",
        "on-secondary-fixed": "#1a1c19",
        "on-secondary-fixed-variant": "#454744",

        tertiary: "#705a49",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#bea38f",
        "on-tertiary-container": "#4c392a",
        "tertiary-fixed": "#fbddc7",
        "tertiary-fixed-dim": "#dec1ac",
        "on-tertiary-fixed": "#28180b",
        "on-tertiary-fixed-variant": "#574333",

        // Panel anahtarlarında açık/kapalı ayrımı için; markanın mocha paletinde
        // yeşil yok, bu yüzden error kırmızısıyla eşleşen tonda ayrı bir token.
        success: "#2e7d32",
        "on-success": "#ffffff",

        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
      },

      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },

      spacing: {
        base: "8px",
        gutter: "24px",
        "margin-mobile": "20px",
        "margin-desktop": "64px",
        "stack-sm": "24px",
        "stack-md": "48px",
        "stack-lg": "80px",
        "container-max": "1280px",
      },

      fontFamily: {
        "display-lg": ["var(--font-playfair)", "Playfair Display", "serif"],
        "display-lg-mobile": ["var(--font-playfair)", "Playfair Display", "serif"],
        "headline-md": ["var(--font-playfair)", "Playfair Display", "serif"],
        "headline-sm": ["var(--font-playfair)", "Playfair Display", "serif"],
        "body-lg": ["var(--font-montserrat)", "Montserrat", "sans-serif"],
        "body-md": ["var(--font-montserrat)", "Montserrat", "sans-serif"],
        "body-sm": ["var(--font-montserrat)", "Montserrat", "sans-serif"],
        "label-caps": ["var(--font-montserrat)", "Montserrat", "sans-serif"],
      },

      fontSize: {
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "600" }],
        "display-lg-mobile": ["32px", { lineHeight: "1.2", fontWeight: "600" }],
        "headline-md": ["32px", { lineHeight: "1.2", fontWeight: "500" }],
        "headline-sm": ["24px", { lineHeight: "1.3", fontWeight: "500" }],
        "body-lg": ["18px", { lineHeight: "1.6", letterSpacing: "0.01em", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "1.0", letterSpacing: "0.1em", fontWeight: "600" }],
      },

      // Mocha tonlu, çok yumuşak ambient gölgeler (Soft Luxury)
      boxShadow: {
        ambient: "0 40px 40px rgba(112, 90, 73, 0.04)",
        "ambient-hover": "0 40px 40px rgba(112, 90, 73, 0.08)",
      },

      maxWidth: {
        "container-max": "1280px",
      },

      transitionDuration: {
        // Lüks tempo: geçişler yavaş
        DEFAULT: "300ms",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/container-queries")],
};
export default config;
