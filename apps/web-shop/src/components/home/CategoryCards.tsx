import Link from "next/link";
import {
  CATEGORY_CONFIG,
  type ProductCategory,
} from "@/lib/categories";

const CATEGORIES: ProductCategory[] = ["stationery", "accessory", "living"];

export function CategoryCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {CATEGORIES.map((key) => {
        const config = CATEGORY_CONFIG[key];
        return (
          <Link
            key={key}
            href={`/shop/${key}`}
            className={[
              "rounded-2xl border-2 p-6 transition-transform hover:-translate-y-0.5",
              config.bgClass,
              config.borderClass,
            ].join(" ")}
          >
            <span className="text-3xl" aria-hidden>
              {config.emoji}
            </span>
            <h2 className={`mt-3 text-lg font-bold ${config.textClass}`}>
              {config.label}
            </h2>
            <p className={`mt-1 text-sm ${config.textClass} opacity-80`}>
              보러가기 →
            </p>
          </Link>
        );
      })}
    </section>
  );
}
