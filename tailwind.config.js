/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand
        mint: "#2dd4a8", // bg-mint — primary buttons, active indicators, FAB
        "mint-hover": "#26c299", // bg-mint-hover — pressed/hover state
        "on-mint": "#123329", // text-on-mint — labels/icons on mint
        destructive: "#ef4444", // bg-destructive / text-destructive — delete/leave

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
      },
    },
  },
  plugins: [],
};
