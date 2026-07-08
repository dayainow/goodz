import { Button } from "@goodz/ui";
import Link from "next/link";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12 text-center">
      <PageViewTracker
        pagePath="/checkout/success"
        componentName="CheckoutSuccessPage"
      />
      <p className="text-sm font-medium text-violet-600">주문 완료</p>
      <h1 className="mt-2 text-3xl font-bold">결제가 완료되었습니다</h1>
      {orderId && (
        <p className="mt-4 font-mono text-sm text-slate-500">
          주문번호 {orderId}
        </p>
      )}
      <p className="mt-4 text-slate-600">
        Goodz MVP mock 결제가 정상 처리되었습니다.
      </p>
      <Link href="/" className="mt-8 inline-block">
        <Button variant="primary">쇼핑 계속하기</Button>
      </Link>
    </main>
  );
}
