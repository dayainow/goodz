import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { ShopCatalog } from "@/components/shop/ShopCatalog";

export const dynamic = "force-dynamic";

export default function ShopPage() {
  return (
    <>
      <PageViewTracker pagePath="/shop" componentName="ShopPage" />
      <ShopCatalog
        title="전체 상품"
        description="Goodz 굿즈 컬렉션을 둘러보세요."
      />
    </>
  );
}
