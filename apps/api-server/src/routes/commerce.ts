import { Router } from "express";
import type { Request, Router as ExpressRouter } from "express";
import type {
  AddCartItemRequest,
  CheckoutRequest,
  CreateProductRequest,
  ProductListResponse,
} from "@goodz/types";
import { addCartItem, buildCartView, getCart } from "../data/cart.js";
import { checkout } from "../data/checkout.js";
import { createProduct, getProductById, listProducts } from "../data/products.js";

export const commerceRouter: ExpressRouter = Router();

function resolveCartId(req: Request): string | undefined {
  const header = req.header("x-cart-id");
  if (header) return header;
  if (typeof req.query.cartId === "string") return req.query.cartId;
  return undefined;
}

commerceRouter.get("/products", (req, res) => {
  const category =
    typeof req.query.category === "string" ? req.query.category : undefined;
  const data: ProductListResponse = listProducts(category);
  res.json(data);
});

commerceRouter.get("/products/:id", (req, res) => {
  const product = getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  res.json(product);
});

commerceRouter.post("/products", (req, res) => {
  const body = req.body as CreateProductRequest;

  try {
    const product = createProduct(body);
    res.status(201).json(product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create product";
    res.status(400).json({ message });
  }
});

commerceRouter.get("/cart", (req, res) => {
  const cartId = resolveCartId(req);
  if (!cartId) {
    res.status(400).json({ message: "cartId is required" });
    return;
  }

  const cart = getCart(cartId);
  if (!cart) {
    res.status(404).json({ message: "Cart not found" });
    return;
  }

  res.json(buildCartView(cart));
});

commerceRouter.post("/cart/items", (req, res) => {
  const body = req.body as AddCartItemRequest;
  if (!body?.productId) {
    res.status(400).json({ message: "productId is required" });
    return;
  }

  try {
    const view = addCartItem(
      resolveCartId(req),
      body.productId,
      body.quantity ?? 1,
    );
    res.json(view);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add cart item";
    const status = message === "Product not found" ? 404 : 400;
    res.status(status).json({ message });
  }
});

commerceRouter.post("/checkout", (req, res) => {
  const body = req.body as CheckoutRequest;
  if (!body?.cartId) {
    res.status(400).json({ message: "cartId is required" });
    return;
  }

  try {
    const result = checkout(body.cartId);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    res.status(400).json({ message });
  }
});
