import type { ProductCategory } from "@/lib/categories";
import { CategoryChips } from "@/components/shop/CategoryChips";
import { ProductGrid } from "@/components/ProductGrid";
import { fetchProducts } from "@/lib/products";

export async function ShopCatalog({
  category,
  title,
  description,
}: {
  category?: ProductCategory;
  title: string;
  description: string;
}) {
  const { products, total } = await fetchProducts(category);
  const pagePath = category ? `/shop/${category}` : "/shop";

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-slate-600">{description}</p>
      </header>

      <div className="mb-8">
        <CategoryChips activeCategory={category} />
      </div>

      <p className="mb-6 text-sm text-slate-500">총 {total}개 상품</p>
      <ProductGrid products={products} pagePath={pagePath} />
    </main>
  );
}
