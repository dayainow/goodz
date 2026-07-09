import type { CartView } from "@goodz/types";
import { getCategoryConfig } from "@/lib/categories";

export function CheckoutOrderSummary({ view }: { view: CartView }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">주문 상품</h2>
        <span className="rounded-full bg-category-stationery-bg px-3 py-1 text-xs font-medium text-category-stationery-text">
          {view.itemCount}개
        </span>
      </div>
      <ul className="mt-5 space-y-4">
        {view.lineItems.map((item) => {
          const category = getCategoryConfig(item.product.category);
          return (
            <li
              key={item.product.id}
              className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex gap-3">
                <span
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-lg border text-lg",
                    category?.bgClass ?? "bg-slate-50",
                    category?.borderClass ?? "border-slate-200",
                  ].join(" ")}
                  aria-hidden
                >
                  {category?.emoji ?? "🛍️"}
                </span>
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-slate-500">
                    {item.product.price.toLocaleString("ko-KR")}원 ×{" "}
                    {item.quantity}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-slate-900">
                {item.lineTotal.toLocaleString("ko-KR")}원
              </p>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>상품 금액</span>
          <span>{view.subtotal.toLocaleString("ko-KR")}원</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>배송비</span>
          <span className="text-emerald-600">무료</span>
        </div>
        <div className="flex justify-between pt-2 text-lg font-bold text-slate-900">
          <span>총 결제 금액</span>
          <span className="text-brand-violet">
            {view.subtotal.toLocaleString("ko-KR")}원
          </span>
        </div>
      </div>
    </section>
  );
}
