import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kpugi: {
          blue: "#2F49E8",
          ink: "#0B1026",
          paper: "#F6F7FB",
          surface: "#FFFFFF",
          naira: "#17A75B",
          cliff: "#E4483C",
          amber: "#F5A623",
          slate: "#64748B",
          border: "#E4E7F0",
        },
      },
      fontFamily: {
        display: ["Clash Display", "sans-serif"],
        sans: ["Satoshi", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        kpugi: {
          "primary": "#2F49E8",
          "primary-content": "#FFFFFF",
          "secondary": "#17A75B",
          "accent": "#F5A623",
          "neutral": "#0B1026",
          "base-100": "#FFFFFF",
          "base-200": "#F6F7FB",
          "base-300": "#E4E7F0",
          "info": "#2F49E8",
          "success": "#17A75B",
          "warning": "#F5A623",
          "error": "#E4483C",
          "--rounded-box": "1rem",
          "--rounded-btn": "0.75rem",
          "--tab-radius": "0.5rem",
        },
      },
    ],
    defaultTheme: "kpugi",
  },
};

export default config;
