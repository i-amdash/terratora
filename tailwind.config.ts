import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#05445E",
        grotto: "#189AB4",
        baby: "#D4F1F4",
        gold: "#E9C46A",
        paper: "#F7FAF9",
      },
      fontFamily: {
        sans: ["var(--font-space)", "Arial", "sans-serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
