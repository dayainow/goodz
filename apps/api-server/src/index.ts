import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  AddCartItemRequest,
  CheckoutRequest,
  CreateProductRequest,
  CreateProcessIncidentRequest,
  ProductListResponse,
} from "@goodz/types";
import { addCartItem, buildCartView, getCart } from "./data/cart.js";
import { checkout } from "./data/checkout.js";
import { createProduct, getProductById, listProducts } from "./data/products.js";
import {
  createIncident,
  listIncidents,
  loadOperationsOverview,
  resolveIncident,
} from "./data/operationsStore.js";
import {
  loadProcessDocument,
  loadProcessMetricSnapshots,
  loadProcessStatus,
} from "./data/processStatus.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const processDashboardDist = path.join(repoRoot, "apps/process-dashboard/dist");
const incidentSeverities = new Set(["low", "medium", "high", "critical"]);
const basicAuthUser = process.env.GOODZ_BASIC_AUTH_USER;
const basicAuthPassword = process.env.GOODZ_BASIC_AUTH_PASSWORD;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  if (req.path === "/health") {
    next();
    return;
  }

  if (!basicAuthUser && !basicAuthPassword) {
    next();
    return;
  }

  if (!basicAuthUser || !basicAuthPassword) {
    res.status(503).json({ message: "Operations authentication is misconfigured" });
    return;
  }

  const authorization = req.header("authorization");
  const encoded = authorization?.startsWith("Basic ")
    ? authorization.slice("Basic ".length)
    : "";
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const separator = decoded.indexOf(":");
  const username = separator >= 0 ? decoded.slice(0, separator) : "";
  const password = separator >= 0 ? decoded.slice(separator + 1) : "";

  if (username !== basicAuthUser || password !== basicAuthPassword) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Goodz Process OS"');
    res.status(401).send("Authentication required");
    return;
  }

  next();
});

function resolveCartId(req: express.Request): string | undefined {
  const header = req.header("x-cart-id");
  if (header) return header;
  if (typeof req.query.cartId === "string") return req.query.cartId;
  return undefined;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "goodz-api" });
});

app.get("/api/process/status", (_req, res) => {
  try {
    res.json(loadProcessStatus());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load process status";
    res.status(500).json({ message });
  }
});

app.get("/api/process/metrics-snapshots", (_req, res) => {
  try {
    res.json(loadProcessMetricSnapshots());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load metric snapshots";
    res.status(500).json({ message });
  }
});

app.get("/api/process/operations", (_req, res) => {
  res.json(loadOperationsOverview());
});

app.get("/api/process/incidents", (_req, res) => {
  res.json({ incidents: listIncidents() });
});

app.post("/api/process/incidents", (req, res) => {
  const body = req.body as CreateProcessIncidentRequest;
  if (
    !body?.title?.trim() ||
    !body?.summary?.trim() ||
    !incidentSeverities.has(body.severity)
  ) {
    res.status(400).json({ message: "title, summary, and valid severity are required" });
    return;
  }

  try {
    res.status(201).json(createIncident(body));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create incident";
    res.status(400).json({ message });
  }
});

app.patch("/api/process/incidents/:id/resolve", (req, res) => {
  const incident = resolveIncident(req.params.id);
  if (!incident) {
    res.status(404).json({ message: "Open incident not found" });
    return;
  }
  res.json(incident);
});

app.get("/api/process/document", (req, res) => {
  const docPath = typeof req.query.path === "string" ? req.query.path : "";

  if (!docPath) {
    res.status(400).json({ message: "path is required" });
    return;
  }

  try {
    res.json(loadProcessDocument(docPath));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load process document";
    res.status(404).json({ message });
  }
});

app.get("/api/products", (req, res) => {
  const category =
    typeof req.query.category === "string" ? req.query.category : undefined;
  const data: ProductListResponse = listProducts(category);
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

app.post("/api/products", (req, res) => {
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

if (fs.existsSync(processDashboardDist)) {
  app.use(express.static(processDashboardDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(processDashboardDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`[goodz-api] http://localhost:${PORT}`);
});
