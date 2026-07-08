const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const CART_ID_KEY = "goodz-cart-id";

export function getApiUrl(): string {
  return API_URL;
}

export function getCartId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CART_ID_KEY);
}

export function setCartId(cartId: string): void {
  localStorage.setItem(CART_ID_KEY, cartId);
}

export async function addToCart(
  productId: string,
  quantity = 1,
): Promise<string> {
  const cartId = getCartId();
  const res = await fetch(`${API_URL}/api/cart/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cartId ? { "x-cart-id": cartId } : {}),
    },
    body: JSON.stringify({ productId, quantity }),
  });

  if (!res.ok) {
    const data = (await res.json()) as { message?: string };
    throw new Error(data.message ?? "장바구니 담기 실패");
  }

  const data = (await res.json()) as { cart: { id: string } };
  setCartId(data.cart.id);
  return data.cart.id;
}
