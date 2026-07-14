import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  ProcessDocumentResponse,
  ProcessMetricSnapshotsFile,
  ProcessStatus,
} from "@goodz/process";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

const statusPath = path.join(repoRoot, "docs/00-process/status.json");
const metricsSnapshotsPath = path.join(repoRoot, "docs/00-process/metrics-snapshots.json");
const docsRoot = path.join(repoRoot, "docs");

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

function extractTitle(content: string, fallback: string) {
  const heading = content
    .split("\n")
    .find((line) => line.trim().startsWith("# "));
  return heading ? heading.replace(/^#\s+/, "").trim() : fallback;
}

export function loadProcessDocument(docPath: string): ProcessDocumentResponse {
  const normalizedPath = path.normalize(docPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const absolutePath = path.resolve(repoRoot, normalizedPath);
  const extension = path.extname(absolutePath);
  const isDocsFile =
    absolutePath.startsWith(`${docsRoot}${path.sep}`) && extension === ".md";

  if (!isDocsFile) {
    throw new Error("Only Markdown files under docs/ can be loaded");
  }

  const content = fs.readFileSync(absolutePath, "utf-8");
  const stats = fs.statSync(absolutePath);

  return {
    path: normalizedPath,
    title: extractTitle(content, path.basename(absolutePath)),
    content,
    updatedAt: stats.mtime.toISOString(),
  };
}
