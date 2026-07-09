import type { CartLineItem as CartLineItemType } from "@goodz/types";
import Link from "next/link";
import { getCategoryConfig } from "@/lib/categories";

export function CartLineItem({ item }: { item: CartLineItemType }) {
  const category = getCategoryConfig(item.product.category);

  return (
    <li className="flex gap-4 px-5 py-4">
      <div
        className={[
          "flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border text-2xl",
          category?.bgClass ?? "bg-slate-100",
          category?.borderClass ?? "border-slate-200",
        ].join(" ")}
        aria-hidden
      >
        {category?.emoji ?? "🛍️"}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${item.product.id}`}
          className="font-semibold hover:text-brand-violet"
        >
          {item.product.name}
        </Link>
        {category && (
          <p className={`mt-0.5 text-xs font-medium ${category.textClass}`}>
            {category.label}
          </p>
        )}
        <p className="mt-1 text-sm text-slate-500">
          {item.product.price.toLocaleString("ko-KR")}원 × {item.quantity}
        </p>
      </div>
      <p className="shrink-0 font-bold text-brand-violet">
        {item.lineTotal.toLocaleString("ko-KR")}원
      </p>
    </li>
  );
}
