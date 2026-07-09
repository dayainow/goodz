import type { Product } from "@goodz/types";
import { getCategoryConfig } from "../../lib/categories";

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
          <tr>
            <th className="px-5 py-3 font-medium">ID</th>
            <th className="px-5 py-3 font-medium">상품명</th>
            <th className="px-5 py-3 font-medium">카테고리</th>
            <th className="px-5 py-3 font-medium">가격</th>
            <th className="px-5 py-3 font-medium">재고</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                등록된 상품이 없습니다.
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const category = getCategoryConfig(product.category);
              return (
                <tr
                  key={product.id}
                  className="border-t border-slate-100 hover:bg-slate-50/80"
                >
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">
                    {product.id}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {product.name}
                  </td>
                  <td className="px-5 py-4">
                    {category ? (
                      <span
                        className={[
                          "inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium",
                          category.chipClass,
                        ].join(" ")}
                      >
                        {category.label}
                      </span>
                    ) : (
                      product.category
                    )}
                  </td>
                  <td className="px-5 py-4 font-semibold text-brand-violet">
                    {product.price.toLocaleString("ko-KR")}원
                  </td>
                  <td className="px-5 py-4 text-slate-600">{product.stock}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
