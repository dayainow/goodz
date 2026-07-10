import Link from "next/link";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { CategoryCards } from "@/components/home/CategoryCards";

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <PageViewTracker pagePath="/about" componentName="AboutPage" />

      <p className="text-sm font-semibold text-brand-violet">About Goodz</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">
        밝고 친근한 굿즈 라이프
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-slate-600">
        Goodz는 20–30대를 위한 파스텔 톤 굿즈 숍입니다. 문구, 액세서리, 리빙
        아이템을 모아 일상에 작은 즐거움을 더해요.
      </p>

      <section className="mt-10 rounded-2xl border border-category-stationery-border bg-category-stationery-bg p-6">
        <h2 className="text-lg font-bold text-category-stationery-text">
          우리의 약속
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-category-stationery-text/90">
          <li>· 파스텔 톤으로 만든 감각적인 굿즈</li>
          <li>· violet 포인트로 이어지는 일관된 브랜드 경험</li>
          <li>· 풀 프로세스 모노레포로 증명하는 레퍼런스 쇼핑몰</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="mb-6 text-xl font-bold">카테고리</h2>
        <CategoryCards />
      </section>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link
          href="/shop"
          className="rounded-lg bg-brand-violet px-6 py-3 text-sm font-semibold text-white hover:bg-brand-violet-hover"
        >
          쇼핑 시작하기
        </Link>
        <Link href="/" className="text-sm font-medium text-brand-violet">
          홈으로 →
        </Link>
      </div>
    </main>
  );
}
