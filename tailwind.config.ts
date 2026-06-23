import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        marmoteiro: {
          ink: "#241212",
          wine: "#6d162f",
          rose: "#b84255",
          gold: "#d89b36",
          leaf: "#3d5a36",
          mist: "#f8efe4",
          paper: "#fff9f0"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"]
      },
      boxShadow: {
        soft: "0 18px 50px rgba(36, 18, 18, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
