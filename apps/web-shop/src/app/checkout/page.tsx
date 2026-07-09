"use client";

import type { CartView, CheckoutResult } from "@goodz/types";
import { Button } from "@goodz/ui";
import { trackEvent } from "ga-analytics-harness/trackEvent";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { CheckoutShippingCard } from "@/components/checkout/CheckoutShippingCard";
import { getApiUrl, getCartId } from "@/lib/cart";

export default function CheckoutPage() {
  const router = useRouter();
  const [view, setView] = useState<CartView | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cartId = getCartId();
    if (!cartId) {
      setLoading(false);
      return;
    }

    fetch(`${getApiUrl()}/api/cart?cartId=${cartId}`)
      .then((res) => {
        if (!res.ok) throw new Error("주문 정보를 불러오지 못했습니다");
        return res.json() as Promise<CartView>;
      })
      .then(setView)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Unknown error"),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleCheckout() {
    const cartId = getCartId();
    if (!cartId) return;

    setPaying(true);
    setError(null);

    trackEvent("purchase_click", {
      page_path: "/checkout",
      component_name: "CheckoutButton",
    });

    try {
      const res = await fetch(`${getApiUrl()}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        throw new Error(data.message ?? "결제에 실패했습니다");
      }

      const result = (await res.json()) as CheckoutResult;
      router.push(`/checkout/success?orderId=${result.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "결제에 실패했습니다");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <>
        <PageViewTracker pagePath="/checkout" componentName="CheckoutPage" />
        <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
          <p className="text-slate-500">불러오는 중…</p>
        </main>
      </>
    );
  }

  if (!view || view.lineItems.length === 0) {
    return (
      <>
        <PageViewTracker pagePath="/checkout" componentName="CheckoutPage" />
        <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
          <p className="text-slate-600">결제할 상품이 없습니다.</p>
          <Link href="/cart" className="mt-4 inline-block text-brand-violet">
            ← 장바구니로
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <PageViewTracker pagePath="/checkout" componentName="CheckoutPage" />
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
        <Link
          href="/cart"
          className="text-sm font-medium text-brand-violet hover:underline"
        >
          ← 장바구니
        </Link>
        <header className="mt-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">주문 / 결제</h1>
          <p className="mt-2 text-sm text-slate-500">
            MVP mock 결제 — 실제 PG 연동 없음
          </p>
        </header>

        <div className="space-y-6">
          <CheckoutOrderSummary view={view} />
          <CheckoutShippingCard />
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </p>
        )}

        <div className="mt-8 rounded-2xl border border-brand-violet/20 bg-brand-violet/5 p-6">
          <p className="text-sm text-slate-600">
            결제 버튼을 누르면 mock 주문이 완료됩니다.
          </p>
          <Button
            variant="primary"
            onClick={handleCheckout}
            disabled={paying}
            className="mt-4 w-full py-3 text-base sm:w-auto"
          >
            {paying ? "결제 처리 중…" : `${view.subtotal.toLocaleString("ko-KR")}원 결제하기`}
          </Button>
        </div>
      </main>
    </>
  );
}
