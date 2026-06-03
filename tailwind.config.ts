import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./providers/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./emails/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // Theme color mappings
        "bg-primary": "#120E0A", // rock
        surface: "#1C1610", // rock-2
        border: "#332A1F", // bone-4
        "border-strong": "#5C4E3A", // bone-3
        "brand-orange": "#FF5500", // ember
        "brand-amber": "#FF8000", // ember-2
        "brand-green": "#3A5C3E", // moss
        "text-primary": "#D4C4A8", // bone
        "text-secondary": "#9A8870", // bone-2
        "text-muted": "#5C4E3A", // bone-3
        "text-dim": "#332A1F", // bone-4

        // Exact mockup variables
        rock: "#120E0A",
        "rock-2": "#1C1610",
        "rock-3": "#251D14",
        "rock-4": "#32271A",
        "rock-5": "#3D3025",
        ember: "#FF5500",
        "ember-2": "#FF8000",
        "ember-3": "#FFAA00",
        bone: "#D4C4A8",
        "bone-2": "#9A8870",
        "bone-3": "#5C4E3A",
        "bone-4": "#332A1F",
        moss: "#3A5C3E",
        gold: "#C8962A",
        danger: "#CC2200",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
        gothic: ["UnifrakturMaguntia", "cursive"],
        serif: ["Crimson Pro", "serif"],
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;

