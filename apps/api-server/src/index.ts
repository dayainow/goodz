import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { commerceRouter } from "./routes/commerce.js";
import { processRouter } from "./routes/process.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const processDashboardDist = path.join(repoRoot, "apps/process-dashboard/dist");
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

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "goodz-api" });
});

app.use("/api", processRouter);
app.use("/api", commerceRouter);

if (fs.existsSync(processDashboardDist)) {
  app.use(express.static(processDashboardDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(processDashboardDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`[goodz-api] http://localhost:${PORT}`);
});
