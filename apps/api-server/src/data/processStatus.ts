import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ProcessMetricSnapshotsFile, ProcessStatus } from "@goodz/types";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

const statusPath = path.join(repoRoot, "docs/00-process/status.json");
const metricsSnapshotsPath = path.join(repoRoot, "docs/00-process/metrics-snapshots.json");

export function loadProcessStatus(): ProcessStatus {
  const raw = fs.readFileSync(statusPath, "utf-8");
  return JSON.parse(raw) as ProcessStatus;
}

export function loadProcessMetricSnapshots(): ProcessMetricSnapshotsFile {
  if (!fs.existsSync(metricsSnapshotsPath)) {
    return { version: 1, updatedAt: "", snapshots: [] };
  }

  const raw = fs.readFileSync(metricsSnapshotsPath, "utf-8");
  return JSON.parse(raw) as ProcessMetricSnapshotsFile;
}
