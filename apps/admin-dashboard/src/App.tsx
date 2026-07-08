import { useEffect, useState } from "react";
import type { Product, ProductListResponse } from "@goodz/types";
import { Button } from "@goodz/ui";
import { fetchProducts } from "./api/products";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then((data: ProductListResponse) => setProducts(data.products))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Unknown error"),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-violet-400">Goodz Admin</p>
          <h1 className="text-2xl font-bold">상품 관리</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">CSV보내기</Button>
          <Button variant="primary">상품 등록</Button>
        </div>
      </header>

      {loading && <p className="text-slate-400">불러오는 중…</p>}
      {error && (
        <p className="rounded-lg bg-rose-950 px-4 py-3 text-rose-200">
          API 오류: {error}
        </p>
      )}

      {!loading && !error && (
        <table className="w-full overflow-hidden rounded-xl border border-slate-800 text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">가격</th>
              <th className="px-4 py-3">재고</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-slate-800">
                <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">
                  {p.price.toLocaleString("ko-KR")}원
                </td>
                <td className="px-4 py-3">{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
