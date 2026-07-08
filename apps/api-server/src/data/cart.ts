import type { Cart, CartItem, CartLineItem, CartView } from "@goodz/types";
import { randomUUID } from "node:crypto";
import { getProductById } from "./products.js";

const carts = new Map<string, Cart>();

function createCart(): Cart {
  const cart: Cart = { id: randomUUID(), items: [] };
  carts.set(cart.id, cart);
  return cart;
}

export function getCart(cartId: string): Cart | undefined {
  return carts.get(cartId);
}

export function getOrCreateCart(cartId?: string): Cart {
  if (cartId) {
    const existing = carts.get(cartId);
    if (existing) return existing;
  }
  return createCart();
}

export function addCartItem(
  cartId: string | undefined,
  productId: string,
  quantity: number,
): CartView {
  const product = getProductById(productId);
  if (!product) {
    throw new Error("Product not found");
  }
  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const cart = getOrCreateCart(cartId);
  const existing = cart.items.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  carts.set(cart.id, cart);
  return buildCartView(cart);
}

function buildLineItem(item: CartItem): CartLineItem | undefined {
  const product = getProductById(item.productId);
  if (!product) return undefined;

  return {
    product,
    quantity: item.quantity,
    lineTotal: product.price * item.quantity,
  };
}

export function buildCartView(cart: Cart): CartView {
  const lineItems = cart.items
    .map(buildLineItem)
    .filter((item): item is CartLineItem => item !== undefined);

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = lineItems.reduce((sum, item) => sum + item.quantity, 0);

  return { cart, lineItems, subtotal, itemCount };
}

export function clearCart(cartId: string): void {
  carts.delete(cartId);
}
