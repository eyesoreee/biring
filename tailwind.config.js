/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // Weight is selected by family class (font-sans-semibold), never by
        // font-weight classes — RN resolves faces by family, not fontWeight.
        sans: ["PublicSans-Regular"],
        "sans-medium": ["PublicSans-Medium"],
        "sans-semibold": ["PublicSans-SemiBold"],
        "sans-bold": ["PublicSans-Bold"],
      },
      colors: {
        // Brand
        mint: "#2dd4a8", // bg-mint — fills only (buttons, FAB, bars on graphite)
        "mint-ink": "#0b7a5c", // text-mint-ink — mint-coloured text/icons on paper
        "mint-hover": "#26c299", // bg-mint-hover — pressed/hover state
        "on-mint": "#123329", // text-on-mint — labels/icons on mint
        destructive: "#ef4444", // bg-destructive — danger fills on graphite
        "destructive-ink": "#c81e1e", // text-destructive-ink — errors on paper

        // Selected surface (pair with dark: variant in classes)
        selected: "#e6f9f3", // bg-selected — active tiles/badges (light)
        "selected-dark": "#183329", // dark:bg-selected-dark — (dark)

        // Graphite family (dark surfaces, usable in both schemes)
        graphite: "#17191c", // bg-graphite — hero cards, dark backgrounds
        "graphite-surface": "#24272b", // bg-graphite-surface — dark surface tiles
        "graphite-border": "#33373d", // border-graphite-border — dividers/strokes

        // Neutrals
        silver: "#a6abb2", // text-silver — eyebrows, labels on dark
        "on-graphite": "#f5f6f7", // text-on-graphite — light text on dark
        canvas: "#f5f6f7", // bg-canvas — app background (use dark:bg-graphite in dark mode)
        surface: "#ffffff", // bg-surface — cards/modals (use dark:bg-graphite-surface)
        edge: "#e2e5e8", // border-edge — hairlines (use dark:border-graphite-border)
        muted: "#6a7078", // text-muted — secondary text (use dark:text-silver)
        placeholder: "#6f757d", // placeholder:text-placeholder (use dark:placeholder:text-placeholder-dark)
        "placeholder-dark": "#9aa0a6", // dark:placeholder:text-placeholder-dark
      },
    },
  },
  plugins: [],
};
