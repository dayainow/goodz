import { notFound } from "next/navigation";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import {
  CATEGORY_CONFIG,
  isProductCategory,
  type ProductCategory,
} from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!isProductCategory(category)) {
    notFound();
  }

  const config = CATEGORY_CONFIG[category as ProductCategory];

  return (
    <>
      <PageViewTracker
        pagePath={`/shop/${category}`}
        componentName="CategoryPage"
      />
      <ShopCatalog
        category={category as ProductCategory}
        title={config.label}
        description={`${config.label} 카테고리 굿즈 모음`}
      />
    </>
  );
}
