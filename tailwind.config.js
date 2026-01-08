/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#10B981", // Emerald Green - Main Brand
          600: "#059669",
        },
        accent: {
          500: "#3B82F6", // Bright Blue - Secondary
          600: "#2563EB",
        },
        warn: {
          500: "#F59E0B", // Warm Amber
        },
        danger: {
          500: "#EF4444", // Red
        },
        surface: "#F9FAFB",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
