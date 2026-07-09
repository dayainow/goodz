import Link from "next/link";
import {
  CATEGORY_CONFIG,
  type ProductCategory,
} from "@/lib/categories";

const CATEGORIES: ProductCategory[] = ["stationery", "accessory", "living"];

export function CategoryChips({
  activeCategory,
}: {
  activeCategory?: ProductCategory;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/shop"
        className={[
          "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
          activeCategory
            ? "border-slate-200 bg-white text-slate-600 hover:border-brand-violet"
            : "border-brand-violet bg-brand-violet text-white",
        ].join(" ")}
      >
        전체
      </Link>
      {CATEGORIES.map((key) => {
        const config = CATEGORY_CONFIG[key];
        const isActive = activeCategory === key;
        return (
          <Link
            key={key}
            href={`/shop/${key}`}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-brand-violet bg-brand-violet text-white"
                : [config.chipClass, "hover:opacity-90"].join(" "),
            ].join(" ")}
          >
            {config.label}
          </Link>
        );
      })}
    </div>
  );
}
