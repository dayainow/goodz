import type { CartView } from "@goodz/types";
import { Button } from "@goodz/ui";
import { trackEvent } from "ga-analytics-harness/trackEvent";
import Link from "next/link";

export function CartSummaryBar({ view }: { view: CartView }) {
  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>상품 {view.itemCount}개</span>
        <span>배송비 무료 (3만원 이상)</span>
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-sm text-slate-500">결제 예정 금액</p>
          <p className="text-2xl font-bold text-slate-900">
            {view.subtotal.toLocaleString("ko-KR")}
            <span className="text-base font-semibold">원</span>
          </p>
        </div>
        <Link
          href="/checkout"
          onClick={() =>
            trackEvent("proceed_to_checkout_click", {
              page_path: "/cart",
              component_name: "ProceedToCheckoutButton",
            })
          }
        >
          <Button variant="primary" className="min-w-[140px] px-6 py-3">
            결제하기
          </Button>
        </Link>
      </div>
    </section>
  );
}
