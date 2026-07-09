import Link from "next/link";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { PromoBanner } from "@/components/home/PromoBanner";
import { CategoryCards } from "@/components/home/CategoryCards";
import { NewsletterFooter } from "@/components/home/NewsletterFooter";
import { ProductGrid } from "@/components/ProductGrid";
import { fetchProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { products } = await fetchProducts();
  const newIn = products.slice(0, 4);

  return (
    <>
      <PromoBanner />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <PageViewTracker pagePath="/" componentName="HomePage" />

        <section className="mb-14 text-center">
          <p className="text-sm font-medium text-brand-violet">Sticky Lemon mood</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            오늘의 굿즈, Goodz
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-slate-600">
            파스텔 톤 문구·액세서리·리빙 아이템을 만나보세요.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-lg bg-brand-violet px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-violet-hover"
          >
            전체 상품 보기
          </Link>
        </section>

        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-bold">카테고리</h2>
          <CategoryCards />
        </section>

        <section className="mb-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold">NEW IN</h2>
            <Link href="/shop" className="text-sm font-medium text-brand-violet">
              모두 보기 →
            </Link>
          </div>
          <ProductGrid products={newIn} pagePath="/" />
        </section>

        <NewsletterFooter />
      </main>
    </>
  );
}
