import { createServer } from "node:http";
import type { ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { findManagedService, listManagedServices } from "./catalog.js";

const port = Number(process.env.PORT) || 4200;

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

export function createInternalServiceApi() {
  return createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");

    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, {
        ok: true,
        service: "goodz-internal-service-reference",
      });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/services") {
      sendJson(response, 200, listManagedServices());
      return;
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/services/")) {
      const id = decodeURIComponent(url.pathname.slice("/api/services/".length));
      const service = findManagedService(id);
      if (!service) {
        sendJson(response, 404, { message: "Service not found" });
        return;
      }
      sendJson(response, 200, service);
      return;
    }

    sendJson(response, 404, { message: "Not found" });
  });
}

const isEntryPoint = process.argv[1] === fileURLToPath(import.meta.url);

if (isEntryPoint) {
  createInternalServiceApi().listen(port, () => {
    console.log(`[goodz-internal-service-reference] http://localhost:${port}`);
  });
}
