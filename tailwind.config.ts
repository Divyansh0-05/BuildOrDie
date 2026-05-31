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
        "bg-primary": "#080810",
        surface: "#0E0E1C",
        border: "#1C1C30",
        "border-strong": "#2A2A45",
        "brand-orange": "#FF4D00",
        "brand-amber": "#F59E0B",
        "brand-green": "#00D680",
        "text-primary": "#F0F0FF",
        "text-secondary": "#8888AA",
        "text-muted": "#5C5C80",
        "text-dim": "#3A3A5A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
