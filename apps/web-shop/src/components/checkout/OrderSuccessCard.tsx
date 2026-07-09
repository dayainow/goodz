import { Button } from "@goodz/ui";
import Link from "next/link";

export function OrderSuccessCard({ orderId }: { orderId?: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-category-living-border bg-gradient-to-b from-category-living-bg to-white px-8 py-12 text-center shadow-sm">
      <div
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl shadow-sm ring-4 ring-category-living-border/50"
        aria-hidden
      >
        🧾
      </div>
      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-brand-violet">
        Order Complete
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        주문이 완료되었어요!
      </h1>
      <p className="mt-3 text-slate-600">
        Goodz에서 주문해 주셔서 감사합니다.
        <br />
        곧 배송 준비를 시작할게요 (mock).
      </p>
      {orderId && (
        <p className="mt-6 inline-block rounded-full bg-white px-4 py-2 font-mono text-sm text-slate-600 shadow-sm">
          주문번호 {orderId}
        </p>
      )}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/">
          <Button variant="primary">홈으로</Button>
        </Link>
        <Link href="/shop" className="text-sm font-medium text-brand-violet">
          쇼핑 계속하기 →
        </Link>
      </div>
    </div>
  );
}
