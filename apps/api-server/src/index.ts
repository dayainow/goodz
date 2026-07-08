import cors from "cors";
import express from "express";
import type { ProductListResponse } from "@goodz/types";
import { getProductById, listProducts } from "./data/products.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`[goodz-api] http://localhost:${PORT}`);
});
