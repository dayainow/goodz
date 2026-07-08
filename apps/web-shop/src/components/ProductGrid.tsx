import type { Product } from "@goodz/types";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <li
          key={product.id}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {product.category}
          </p>
          <h2 className="mt-1 text-lg font-semibold">{product.name}</h2>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">
            {product.description}
          </p>
          <p className="mt-4 text-xl font-bold text-violet-700">
            {product.price.toLocaleString("ko-KR")}원
          </p>
          <p className="mt-1 text-xs text-slate-400">재고 {product.stock}</p>
        </li>
      ))}
    </ul>
  );
}
