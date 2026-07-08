/** Generates a compiled stylesheet of this package's own utility classes for design-sync previews. */
import preset from "./tailwind.config.ts";

export default {
  presets: [preset],
  content: ["./src/**/*.{ts,tsx}"],
};
