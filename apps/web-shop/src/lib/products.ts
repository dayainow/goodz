import type { Product, ProductListResponse } from "@goodz/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function fetchProducts(category?: string): Promise<ProductListResponse> {
  const url = new URL(`${API_URL}/api/products`);
  if (category) {
    url.searchParams.set("category", category);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json() as Promise<ProductListResponse>;
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json() as Promise<Product>;
}
