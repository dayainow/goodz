import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  ProcessDocumentResponse,
  ProcessMetricSnapshotsFile,
  ProcessReferenceCapability,
  ProcessStatus,
} from "@goodz/process";

const sourceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const workspaceRoot = process.env.GOODZ_WORKSPACE_ROOT
  ? path.resolve(process.env.GOODZ_WORKSPACE_ROOT)
  : sourceRoot;
const runtimeConfigPath = process.env.GOODZ_CONFIG_PATH
  ? path.resolve(process.env.GOODZ_CONFIG_PATH)
  : path.join(workspaceRoot, "goodz.config.json");
const docsRoot = path.join(workspaceRoot, "docs");

interface InternalReferenceConfig {
  id: string;
  name: string;
  statusPath: string;
  metricsPath: string;
}

interface GoodzRuntimeConfig {
  platform?: {
    internalReference?: InternalReferenceConfig;
  };
}

function resolveInternalReference(): (InternalReferenceConfig & {
  absoluteStatusPath: string;
  absoluteMetricsPath: string;
}) | null {
  if (!fs.existsSync(runtimeConfigPath)) return null;
  const config = JSON.parse(fs.readFileSync(runtimeConfigPath, "utf-8")) as GoodzRuntimeConfig;
  const reference = config.platform?.internalReference;
  if (!reference) return null;

  const absoluteStatusPath = path.resolve(workspaceRoot, reference.statusPath);
  const absoluteMetricsPath = path.resolve(workspaceRoot, reference.metricsPath);
  const isInsideRepository = (candidate: string) =>
    candidate === workspaceRoot || candidate.startsWith(`${workspaceRoot}${path.sep}`);
  if (!isInsideRepository(absoluteStatusPath) || !isInsideRepository(absoluteMetricsPath)) {
    throw new Error("Internal Reference paths must stay inside the repository");
  }
  if (!fs.existsSync(absoluteStatusPath)) return null;
  return { ...reference, absoluteStatusPath, absoluteMetricsPath };
}

export function loadProcessReferenceCapability(): ProcessReferenceCapability {
  const reference = resolveInternalReference();
  return reference
    ? { available: true, id: reference.id, name: reference.name }
    : { available: false };
}

export function loadProcessStatus(): ProcessStatus {
  const reference = resolveInternalReference();
  if (!reference) throw new Error("Internal Goodz Reference is not enabled for this Workspace");
  const raw = fs.readFileSync(reference.absoluteStatusPath, "utf-8");
  return JSON.parse(raw) as ProcessStatus;
}

export function loadProcessMetricSnapshots(): ProcessMetricSnapshotsFile {
  const reference = resolveInternalReference();
  if (!reference || !fs.existsSync(reference.absoluteMetricsPath)) {
    return { version: 1, updatedAt: "", snapshots: [] };
  }

  const raw = fs.readFileSync(reference.absoluteMetricsPath, "utf-8");
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
  const absolutePath = path.resolve(workspaceRoot, normalizedPath);
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
