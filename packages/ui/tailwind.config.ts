import type { Config } from "tailwindcss";

/** 앱 tailwind.config 에서 presets: [goodzPreset] 로 사용 */
const goodzPreset: Config = {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          violet: "#7C3AED",
          "violet-hover": "#6D28D9",
        },
        category: {
          stationery: {
            bg: "#FFF8DB",
            border: "#FDE68A",
            accent: "#FBBF24",
            text: "#92400E",
          },
          accessory: {
            bg: "#FFF0F5",
            border: "#FBCFE8",
            accent: "#F472B6",
            text: "#9D174D",
          },
          living: {
            bg: "#ECFDF5",
            border: "#A7F3D0",
            accent: "#34D399",
            text: "#065F46",
          },
          "living-peach": {
            bg: "#FFF7ED",
            border: "#FED7AA",
            accent: "#FB923C",
            text: "#9A3412",
          },
        },
      },
    },
  },
  plugins: [],
};

export default goodzPreset;
