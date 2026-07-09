import { Button } from "@goodz/ui";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { getCategoryConfig } from "@/lib/categories";
import { fetchProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
        <p className="text-lg font-semibold">상품을 찾을 수 없습니다.</p>
        <Link href="/shop" className="mt-4 inline-block text-brand-violet">
          ← 목록으로
        </Link>
      </main>
    );
  }

  const category = getCategoryConfig(product.category);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <Link href="/shop" className="text-sm text-brand-violet hover:underline">
        ← 상품 목록
      </Link>

      <article className="mt-8">
        <PageViewTracker
          pagePath={`/products/${product.id}`}
          componentName="ProductDetailPage"
        />
        {category && (
          <span
            className={[
              "inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium",
              category.chipClass,
            ].join(" ")}
          >
            {category.label}
          </span>
        )}
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          {product.name}
        </h1>
        <p className="mt-4 text-slate-600">{product.description}</p>
        <p className="mt-6 text-3xl font-bold text-brand-violet">
          {product.price.toLocaleString("ko-KR")}원
        </p>
        <p className="mt-2 text-sm text-slate-500">재고 {product.stock}개</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <AddToCartButton productId={product.id} />
          <Link href="/cart">
            <Button variant="secondary">장바구니 보기</Button>
          </Link>
        </div>
      </article>
    </main>
  );
}
