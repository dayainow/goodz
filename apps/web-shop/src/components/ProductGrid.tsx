"use client";

import type { Product } from "@goodz/types";
import { Card } from "@goodz/ui";
import { trackEvent } from "ga-analytics-harness/trackEvent";
import Link from "next/link";
import { getCategoryConfig } from "@/lib/categories";

export function ProductGrid({
  products,
  pagePath = "/shop",
}: {
  products: Product[];
  pagePath?: string;
}) {
  return (
    <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {products.map((product) => {
        const category = getCategoryConfig(product.category);
        return (
          <li key={product.id}>
            <Link
              href={`/products/${product.id}`}
              className="block h-full"
              onClick={() =>
                trackEvent("product_card_click", {
                  page_path: pagePath,
                  component_name: "ProductCard",
                })
              }
            >
              <Card className="h-full overflow-hidden border-slate-200/80 p-0 transition-shadow hover:shadow-md">
                <div
                  className={[
                    "flex h-28 items-center justify-center text-4xl",
                    category?.bgClass ?? "bg-slate-100",
                  ].join(" ")}
                  aria-hidden
                >
                  {category?.emoji ?? "🛍️"}
                </div>
                <div className="p-4">
                  {category && (
                    <span
                      className={[
                        "inline-block rounded-full border px-2 py-0.5 text-xs font-medium",
                        category.chipClass,
                      ].join(" ")}
                    >
                      {category.label}
                    </span>
                  )}
                  <h2 className="mt-2 text-base font-semibold leading-snug">
                    {product.name}
                  </h2>
                  <p className="mt-2 text-lg font-bold text-brand-violet">
                    {product.price.toLocaleString("ko-KR")}원
                  </p>
                </div>
              </Card>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
