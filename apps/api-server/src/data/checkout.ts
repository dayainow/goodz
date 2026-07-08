import type { CheckoutResult } from "@goodz/types";
import { buildCartView, clearCart, getCart } from "./cart.js";

export function checkout(cartId: string): CheckoutResult {
  const cart = getCart(cartId);
  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const view = buildCartView(cart);
  const orderId = `ord-${Date.now()}`;

  const result: CheckoutResult = {
    orderId,
    total: view.subtotal,
    status: "paid",
    items: view.lineItems,
  };

  clearCart(cartId);
  return result;
}
