import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        marmoteiro: {
          black: "#000000",
          charcoal: "#111111",
          panel: "#171717",
          card: "#3b2700",
          amber: "#ff9700",
          amberDark: "#9b6000",
          yellow: "#ffb21a",
          red: "#f51f28",
          text: "#f8f7f4",
          muted: "#b7b2aa"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"]
      },
      boxShadow: {
        amber: "0 0 22px rgba(255, 151, 0, 0.36)",
        soft: "0 18px 50px rgba(0, 0, 0, 0.34)"
      }
    }
  },
  plugins: []
};

export default config;
