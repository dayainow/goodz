"use client";

import type { CartView } from "@goodz/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { CartEmptyState } from "@/components/cart/CartEmptyState";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummaryBar } from "@/components/cart/CartSummaryBar";
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
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
        <header className="mb-8">
          <Link
            href="/shop"
            className="text-sm font-medium text-brand-violet hover:underline"
          >
            ← 쇼핑 계속하기
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">장바구니</h1>
          {!isEmpty && (
            <p className="mt-2 text-sm text-slate-500">
              담은 상품 {view.itemCount}개
            </p>
          )}
        </header>

        {isEmpty ? (
          <CartEmptyState />
        ) : (
          <>
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {view.lineItems.map((item) => (
                <CartLineItem key={item.product.id} item={item} />
              ))}
            </ul>
            <CartSummaryBar view={view} />
          </>
        )}
      </main>
    </>
  );
}
