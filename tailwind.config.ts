import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0B0C",
        surface: {
          DEFAULT: "#111214",
          raised: "#17181B",
        },
        border: "#26272B",
        text: {
          DEFAULT: "#F5F5F3",
          secondary: "#A7A7A4",
          muted: "#717177",
        },
        brand: {
          DEFAULT: "#D8B45A",
          hover: "#C9A54B",
          muted: "rgba(216, 180, 90, 0.1)",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Georgia", "Cambria", "Times New Roman", "Times", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
