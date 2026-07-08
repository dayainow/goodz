import type { ProductListResponse } from "@goodz/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export async function fetchProducts(): Promise<ProductListResponse> {
  const res = await fetch(`${API_URL}/api/products`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ProductListResponse>;
}
