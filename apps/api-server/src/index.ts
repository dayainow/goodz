import cors from "cors";
import express from "express";
import type {
  AddCartItemRequest,
  CheckoutRequest,
  ProductListResponse,
} from "@goodz/types";
import { addCartItem, buildCartView, getCart } from "./data/cart.js";
import { checkout } from "./data/checkout.js";
import { getProductById, listProducts } from "./data/products.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

function resolveCartId(req: express.Request): string | undefined {
  const header = req.header("x-cart-id");
  if (header) return header;
  if (typeof req.query.cartId === "string") return req.query.cartId;
  return undefined;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "goodz-api" });
});

app.get("/api/products", (_req, res) => {
  const data: ProductListResponse = listProducts();
  res.json(data);
});

app.get("/api/products/:id", (req, res) => {
  const product = getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  res.json(product);
});

app.get("/api/cart", (req, res) => {
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

app.post("/api/cart/items", (req, res) => {
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

app.post("/api/checkout", (req, res) => {
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

app.listen(PORT, () => {
  console.log(`[goodz-api] http://localhost:${PORT}`);
});
