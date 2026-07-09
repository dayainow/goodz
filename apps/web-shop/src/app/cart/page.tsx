"use client";

import type { CartView } from "@goodz/types";
import { Button } from "@goodz/ui";
import { trackEvent } from "ga-analytics-harness/trackEvent";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { getApiUrl, getCartId } from "@/lib/cart";

export default function CartPage() {
  const [view, setView] = useState<CartView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cartId = getCartId();
    if (!cartId) {
      setLoading(false);
      return;
    }

    fetch(`${getApiUrl()}/api/cart?cartId=${cartId}`)
      .then((res) => {
        if (!res.ok) throw new Error("장바구니를 불러오지 못했습니다");
        return res.json() as Promise<CartView>;
      })
      .then(setView)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Unknown error"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <PageViewTracker pagePath="/cart" componentName="CartPage" />
        <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
          <p className="text-slate-500">불러오는 중…</p>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageViewTracker pagePath="/cart" componentName="CartPage" />
        <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
          <p className="text-rose-600">{error}</p>
        </main>
      </>
    );
  }

  const isEmpty = !view || view.lineItems.length === 0;

  return (
    <>
      <PageViewTracker pagePath="/cart" componentName="CartPage" />
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <header className="mb-8">
        <Link href="/shop" className="text-sm text-brand-violet hover:underline">
          ← 쇼핑 계속하기
        </Link>
        <h1 className="mt-4 text-3xl font-bold">장바구니</h1>
        {!isEmpty && (
          <p className="mt-2 text-sm text-slate-500">
            총 {view.itemCount}개 상품
          </p>
        )}
      </header>

      {isEmpty ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-slate-600">장바구니가 비어 있습니다.</p>
          <Link href="/shop" className="mt-4 inline-block">
            <Button variant="primary">상품 보러가기</Button>
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {view.lineItems.map((item) => (
              <li
                key={item.product.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-sm text-slate-500">
                    {item.product.price.toLocaleString("ko-KR")}원 ×{" "}
                    {item.quantity}
                  </p>
                </div>
                <p className="font-bold text-brand-violet">
                  {item.lineTotal.toLocaleString("ko-KR")}원
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xl font-bold">
              합계 {view.subtotal.toLocaleString("ko-KR")}원
            </p>
            <Link
              href="/checkout"
              onClick={() =>
                trackEvent("proceed_to_checkout_click", {
                  page_path: "/cart",
                  component_name: "ProceedToCheckoutButton",
                })
              }
            >
              <Button variant="primary">결제하기</Button>
            </Link>
          </div>
        </>
      )}
      </main>
    </>
  );
}
