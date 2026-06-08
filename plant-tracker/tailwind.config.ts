import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: "#f1f8f1",
          100: "#dcefdc",
          200: "#bbdebb",
          300: "#8dc68d",
          400: "#5ba85b",
          500: "#3d8b3d",
          600: "#2e6f2e",
          700: "#265826",
          800: "#1f4720",
          900: "#1a3b1b",
          950: "#0c200d",
        },
        soil: {
          50: "#faf6f1",
          100: "#f1e8d8",
          200: "#e1cfae",
          300: "#cdaf7d",
          400: "#b88f56",
          500: "#a3753f",
          600: "#8a5e34",
          700: "#6f4a2c",
          800: "#5b3d27",
          900: "#4c3424",
          950: "#2a1c12",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.06)",
      },
    },
  },
  plugins: [],
};

export default config;
