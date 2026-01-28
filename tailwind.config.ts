import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        background: "var(--color-background)",
        foreground: "var(--color-text)",
      },
      fontFamily: {
        sans: ["var(--font-heading)", "sans-serif"],
        serif: ["var(--font-body)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
