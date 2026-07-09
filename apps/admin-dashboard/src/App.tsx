import { useCallback, useEffect, useState } from "react";
import type { CreateProductRequest, Product } from "@goodz/types";
import { Button } from "@goodz/ui";
import { createProduct, fetchProducts } from "./api/products";
import { AdminLayout } from "./components/layout/AdminLayout";
import type { AdminView } from "./components/layout/AdminSidebar";
import { ProductCreateForm } from "./components/products/ProductCreateForm";
import { ProductTable } from "./components/products/ProductTable";

export default function App() {
  const [view, setView] = useState<AdminView>("list");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data.products);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  async function handleCreate(input: CreateProductRequest) {
    await createProduct(input);
    await loadProducts();
    setView("list");
  }

  return (
    <AdminLayout
      activeView={view}
      onNavigate={setView}
      title={view === "list" ? "상품 목록" : "상품 등록"}
      description={
        view === "list"
          ? `총 ${products.length}개 상품 · API 연동`
          : "새 굿즈 상품을 등록합니다"
      }
      actions={
        view === "list" ? (
          <div className="flex gap-2">
            <Button variant="secondary" disabled>
              CSV보내기
            </Button>
            <Button variant="primary" onClick={() => setView("create")}>
              + 상품 등록
            </Button>
          </div>
        ) : undefined
      }
    >
      {view === "list" ? (
        <>
          {loading && <p className="text-slate-500">불러오는 중…</p>}
          {error && (
            <p className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-rose-600">
              API 오류: {error}
            </p>
          )}
          {!loading && !error && <ProductTable products={products} />}
        </>
      ) : (
        <ProductCreateForm
          onSubmit={handleCreate}
          onCancel={() => setView("list")}
        />
      )}
    </AdminLayout>
  );
}
