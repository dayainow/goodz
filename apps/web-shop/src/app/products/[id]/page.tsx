import type { Product } from "@goodz/types";
import { Button } from "@goodz/ui";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json() as Promise<Product>;
}

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
        <p className="text-lg font-semibold">상품을 찾을 수 없습니다.</p>
        <Link href="/" className="mt-4 inline-block text-violet-600">
          ← 목록으로
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-violet-600 hover:underline">
        ← 상품 목록
      </Link>

      <article className="mt-8">
        <PageViewTracker
          pagePath={`/products/${product.id}`}
          componentName="ProductDetailPage"
        />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {product.category}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {product.name}
        </h1>
        <p className="mt-4 text-slate-600">{product.description}</p>
        <p className="mt-6 text-3xl font-bold text-violet-700">
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
