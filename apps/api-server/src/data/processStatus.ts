import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ProcessStatus } from "@goodz/types";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

const statusPath = path.join(repoRoot, "docs/00-process/status.json");

export function loadProcessStatus(): ProcessStatus {
  const raw = fs.readFileSync(statusPath, "utf-8");
  return JSON.parse(raw) as ProcessStatus;
}
