export type ProductCategory = "stationery" | "accessory" | "living";

export const CATEGORY_CONFIG: Record<
  ProductCategory,
  {
    label: string;
    emoji: string;
    bgClass: string;
    borderClass: string;
    accentClass: string;
    textClass: string;
    chipClass: string;
  }
> = {
  stationery: {
    label: "문구",
    emoji: "✏️",
    bgClass: "bg-category-stationery-bg",
    borderClass: "border-category-stationery-border",
    accentClass: "bg-category-stationery-accent",
    textClass: "text-category-stationery-text",
    chipClass:
      "bg-category-stationery-bg text-category-stationery-text border-category-stationery-border",
  },
  accessory: {
    label: "액세서리",
    emoji: "🎀",
    bgClass: "bg-category-accessory-bg",
    borderClass: "border-category-accessory-border",
    accentClass: "bg-category-accessory-accent",
    textClass: "text-category-accessory-text",
    chipClass:
      "bg-category-accessory-bg text-category-accessory-text border-category-accessory-border",
  },
  living: {
    label: "리빙",
    emoji: "🏠",
    bgClass: "bg-category-living-bg",
    borderClass: "border-category-living-border",
    accentClass: "bg-category-living-accent",
    textClass: "text-category-living-text",
    chipClass:
      "bg-category-living-bg text-category-living-text border-category-living-border",
  },
};

export function isProductCategory(value: string): value is ProductCategory {
  return value in CATEGORY_CONFIG;
}

export function getCategoryConfig(category: string) {
  if (isProductCategory(category)) {
    return CATEGORY_CONFIG[category];
  }
  return null;
}
