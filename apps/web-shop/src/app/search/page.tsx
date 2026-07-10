import Link from "next/link";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { ProductGrid } from "@/components/ProductGrid";
import { fetchProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const { products } = await fetchProducts();
  const results = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()),
      )
    : products;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <PageViewTracker pagePath="/search" componentName="SearchPage" />
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">검색</h1>
        <p className="mt-2 text-slate-600">
          {query
            ? `「${query}」 검색 결과 ${results.length}건`
            : "전체 상품을 검색할 수 있어요"}
        </p>
      </header>

      <form action="/search" method="get" className="mb-8 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="상품명, 설명, 카테고리…"
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/20"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand-violet px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-violet-hover"
        >
          검색
        </button>
      </form>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-600">검색 결과가 없습니다.</p>
          <Link href="/shop" className="mt-4 inline-block text-brand-violet">
            전체 상품 보기 →
          </Link>
        </div>
      ) : (
        <ProductGrid products={results} pagePath="/search" />
      )}
    </main>
  );
}
