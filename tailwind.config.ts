import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme
        "dh-bg": "#1e1e2e",
        "dh-icon": "#4ade80",
        "dh-text": "#ffffff",
        "dh-user-msg": "#2d2d3f",
        "dh-agent-msg": "#181825",
        // Light theme
        "lh-bg": "#ffffff",
        "lh-icon": "#22c55e",
        "lh-text": "#1f2937",
        "lh-user-msg": "#f3f4f6",
        "lh-agent-msg": "#ffffff",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "typing-bounce": {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-4px)", opacity: "1" },
        },
        "theme-fade": {
          "0%": { opacity: "0.7" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out",
        "typing-bounce": "typing-bounce 1.4s infinite ease-in-out",
        "theme-fade": "theme-fade 0.3s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
