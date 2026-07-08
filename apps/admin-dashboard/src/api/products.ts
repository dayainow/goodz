import type { CreateProductRequest, Product, ProductListResponse } from "@goodz/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export async function fetchProducts(): Promise<ProductListResponse> {
  const res = await fetch(`${API_URL}/api/products`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ProductListResponse>;
}

export async function createProduct(
  input: CreateProductRequest,
): Promise<Product> {
  const res = await fetch(`${API_URL}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<Product>;
}
