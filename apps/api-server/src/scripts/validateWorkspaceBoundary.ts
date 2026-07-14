import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Server } from "node:http";

const root = await mkdtemp(path.join(os.tmpdir(), "goodz-empty-workspace-"));
let server: Server | undefined;

try {
  await mkdir(path.join(root, "docs"), { recursive: true });
  await mkdir(path.join(root, ".goodz"), { recursive: true });
  await writeFile(path.join(root, "goodz.config.json"), JSON.stringify({
    version: 2,
    product: { name: "Goodz", edition: "core", description: "Empty Workspace" },
    platform: {
      modelPackage: "@goodz/process",
      consoleApp: "apps/process-dashboard",
      apiPrefix: "/api/process",
      sourceOfTruth: "operations-db",
    },
    references: [],
  }));
  await writeFile(path.join(root, ".goodz/workspace.json"), JSON.stringify({
    version: 1,
    id: "WS-EMPTY-TEST",
    name: "Empty Test Workspace",
    createdAt: new Date().toISOString(),
    storage: { engine: "sqlite", path: ".goodz/data/goodz.db" },
  }));
  process.env.GOODZ_WORKSPACE_ROOT = root;
  process.env.GOODZ_DB_PATH = ":memory:";

  const { loadProcessReferenceCapability, loadProcessStatus } = await import("../data/processStatus.js");
  const capability = loadProcessReferenceCapability();
  if (capability.available) throw new Error("A new Workspace exposed the Goodz internal Reference");

  let rejected = false;
  try {
    loadProcessStatus();
  } catch (error) {
    rejected = error instanceof Error && error.message.includes("not enabled");
  }
  if (!rejected) throw new Error("A new Workspace loaded Goodz internal status data");

  const { loadProcessWorkspace } = await import("../data/operationsStore.js");
  const workspace = loadProcessWorkspace();
  if (workspace.projects.length !== 0 || workspace.runs.length !== 0) {
    throw new Error("A new Workspace did not start empty");
  }
  if (workspace.templates.length < 2) {
    throw new Error("Packaged Process Templates were not available to a new Workspace");
  }

  const express = (await import("express")).default;
  const { processRouter } = await import("../routes/process.js");
  const app = express();
  app.use(express.json());
  app.use("/api", processRouter);
  server = await new Promise<Server>((resolve, reject) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    listener.on("error", reject);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Failed to start boundary HTTP server");
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const referenceResponse = await fetch(`${baseUrl}/api/process/reference`);
  const referenceBody = await referenceResponse.json() as { available?: boolean };
  if (!referenceResponse.ok || referenceBody.available !== false) {
    throw new Error("Empty Workspace Reference capability HTTP contract failed");
  }
  const statusResponse = await fetch(`${baseUrl}/api/process/status`);
  if (statusResponse.status !== 404) throw new Error("Empty Workspace exposed internal status over HTTP");
  const workspaceResponse = await fetch(`${baseUrl}/api/process/workspace`);
  const workspaceBody = await workspaceResponse.json() as { projects?: unknown[]; templates?: unknown[] };
  if (!workspaceResponse.ok || workspaceBody.projects?.length !== 0 || (workspaceBody.templates?.length ?? 0) < 2) {
    throw new Error("Empty Workspace HTTP projection is invalid");
  }

  console.log("empty Workspace HTTP: zero projects + packaged templates + no Goodz internal history");
} finally {
  if (server) await new Promise<void>((resolve) => server?.close(() => resolve()));
  delete process.env.GOODZ_WORKSPACE_ROOT;
  delete process.env.GOODZ_DB_PATH;
  await rm(root, { recursive: true, force: true });
}
