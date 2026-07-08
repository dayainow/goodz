import type { ProductListResponse } from "@goodz/types";
import { Button } from "@goodz/ui";
import { ProductGrid } from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getProducts(): Promise<ProductListResponse> {
  const res = await fetch(`${API_URL}/api/products`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json() as Promise<ProductListResponse>;
}

export default async function HomePage() {
  const { products, total } = await getProducts();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-violet-600">Goodz Shop</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            오늘의 굿즈
          </h1>
          <p className="mt-2 text-slate-600">
            API 타입 <code className="rounded bg-slate-200 px-1">@goodz/types</code>
            를 프론트·백엔드가 공유합니다.
          </p>
        </div>
        <Button variant="primary">장바구니 보기</Button>
      </header>

      <p className="mb-6 text-sm text-slate-500">총 {total}개 상품</p>
      <ProductGrid products={products} />
    </main>
  );
}
