import { light } from "@mui/material/styles/createPalette";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          blue: "var(--primary-blue)",
        },
        dark: {
          blue: "var(--dark-blue)",
          highBlue: "var(--high-dark-blue)",
        },
        light: {
          blue: "var(--light-blue)",
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
