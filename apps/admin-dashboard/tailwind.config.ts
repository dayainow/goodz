import type { Config } from "tailwindcss";
import goodzPreset from "@goodz/ui/tailwind.config";

const config: Config = {
  presets: [goodzPreset],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
