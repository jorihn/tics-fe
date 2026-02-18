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
        ink: "var(--ink)",
        canvas: "var(--canvas)",
        accent: "var(--accent)",
        accentSoft: "var(--accent-soft)",
        borderTone: "var(--border-tone)",
      },
      boxShadow: {
        cta: "0 12px 30px -12px rgba(255, 95, 46, 0.55)",
      },
      fontFamily: {
        heading: ["var(--font-rubik)", "sans-serif"],
        body: ["var(--font-nunito-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
