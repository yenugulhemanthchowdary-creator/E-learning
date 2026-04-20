import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#090e1a",
        panel: "#121b2f",
        accent: "#34d399",
        warning: "#f59e0b",
      },
    },
  },
  plugins: [],
};

export default config;
