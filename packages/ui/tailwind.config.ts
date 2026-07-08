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
    },
  },
  plugins: [],
};

export default goodzPreset;
