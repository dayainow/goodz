"use client";

import type { CartView, CheckoutResult } from "@goodz/types";
import { Button } from "@goodz/ui";
import { trackEvent } from "ga-analytics-harness/trackEvent";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
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
          <Link href="/cart" className="mt-4 inline-block text-violet-600">
            ← 장바구니로
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <PageViewTracker pagePath="/checkout" componentName="CheckoutPage" />
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <Link href="/cart" className="text-sm text-violet-600 hover:underline">
        ← 장바구니
      </Link>
      <h1 className="mt-4 text-3xl font-bold">주문 / 결제</h1>
      <p className="mt-2 text-sm text-slate-500">
        MVP: 실제 PG 연동 없이 mock 결제입니다.
      </p>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">주문 요약</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {view.lineItems.map((item) => (
            <li key={item.product.id} className="flex justify-between gap-4">
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span>{item.lineTotal.toLocaleString("ko-KR")}원</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-slate-200 pt-4 text-lg font-bold">
          총 {view.subtotal.toLocaleString("ko-KR")}원
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        <p>받는 사람: 홍길동 (mock)</p>
        <p className="mt-1">연락처: 010-0000-0000 (mock)</p>
      </section>

      {error && <p className="mt-4 text-rose-600">{error}</p>}

      <div className="mt-8">
        <Button
          variant="primary"
          onClick={handleCheckout}
          disabled={paying}
          className="w-full sm:w-auto"
        >
          {paying ? "결제 처리 중…" : "결제하기 (mock)"}
        </Button>
      </div>
      </main>
    </>
  );
}
