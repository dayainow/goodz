import { Button } from "@goodz/ui";
import Link from "next/link";

export function CartEmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-category-accessory-border bg-category-accessory-bg px-8 py-14 text-center">
      <div
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl shadow-sm"
        aria-hidden
      >
        🛒
      </div>
      <h2 className="mt-6 text-xl font-bold text-slate-900">
        장바구니가 비어 있어요
      </h2>
      <p className="mx-auto mt-2 max-w-xs text-sm text-slate-600">
        파스텔 굿즈를 둘러보고 마음에 드는 상품을 담아보세요.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/shop">
          <Button variant="primary">상품 보러가기</Button>
        </Link>
        <Link href="/" className="text-sm font-medium text-brand-violet">
          홈으로 →
        </Link>
      </div>
    </div>
  );
}
