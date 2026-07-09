export type ProductCategory = "stationery" | "accessory" | "living";

export const CATEGORY_CONFIG: Record<
  ProductCategory,
  { label: string; chipClass: string }
> = {
  stationery: {
    label: "문구",
    chipClass:
      "bg-category-stationery-bg text-category-stationery-text border-category-stationery-border",
  },
  accessory: {
    label: "액세서리",
    chipClass:
      "bg-category-accessory-bg text-category-accessory-text border-category-accessory-border",
  },
  living: {
    label: "리빙",
    chipClass:
      "bg-category-living-bg text-category-living-text border-category-living-border",
  },
};

export function getCategoryConfig(category: string) {
  if (category in CATEGORY_CONFIG) {
    return CATEGORY_CONFIG[category as ProductCategory];
  }
  return null;
}
