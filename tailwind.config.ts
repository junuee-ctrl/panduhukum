import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palet tenang & tepercaya: biru-teal kalem + netral hangat.
        brand: {
          50: "#eef6f6",
          100: "#d6e9ea",
          200: "#aed3d5",
          300: "#7fb6ba",
          400: "#4f9599",
          500: "#357b80",
          600: "#286266",
          700: "#224e52",
          800: "#1f4043",
          900: "#1c3639",
        },
        ink: {
          DEFAULT: "#1f2a2b",
          soft: "#3f4c4d",
          muted: "#6b7778",
        },
        paper: "#fbfaf7",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "44rem",
      },
    },
  },
  plugins: [],
};

export default config;
