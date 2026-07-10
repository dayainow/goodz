/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss";
import goodzPreset from "@goodz/ui/tailwind.config";

export default {
  presets: [goodzPreset],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
