import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { OrderSuccessCard } from "@/components/checkout/OrderSuccessCard";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <PageViewTracker
        pagePath="/checkout/success"
        componentName="CheckoutSuccessPage"
      />
      <OrderSuccessCard orderId={orderId} />
    </main>
  );
}
