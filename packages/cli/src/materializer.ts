import { createHash, randomUUID } from "node:crypto";
import { lstat, mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ProcessProjectExportBundle } from "@goodz/process";

interface ExportManifestFile {
  path: string;
  sha256: string;
}

interface ExportManifest {
  version: 1;
  projectId: string;
  bundleGeneratedAt: string;
  exportedAt: string;
  files: ExportManifestFile[];
}

export interface MaterializeOptions {
  root: string;
  force?: boolean;
  dryRun?: boolean;
}

export interface MaterializeResult {
  projectId: string;
  manifestPath: string;
  written: string[];
  skipped: string[];
  dryRun: boolean;
}

export class MaterializationConflictError extends Error {
  readonly paths: string[];

  constructor(paths: string[]) {
    super(`Local changes would be overwritten: ${paths.join(", ")}`);
    this.name = "MaterializationConflictError";
    this.paths = paths;
  }
}

function sha256(content: string | Buffer) {
  return createHash("sha256").update(content).digest("hex");
}

function manifestFileName(projectId: string) {
  const safeId = projectId.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  if (!safeId) throw new Error("Invalid project id");
  return `${safeId}.json`;
}

function resolveExportPath(root: string, relativePath: string) {
  const normalized = relativePath.replaceAll("\\", "/");
  if (path.posix.isAbsolute(normalized) || normalized.split("/").includes("..")) {
    throw new Error(`Unsafe export path: ${relativePath}`);
  }
  if (!normalized.startsWith("docs/projects/") || !normalized.endsWith(".md")) {
    throw new Error(`Export path must be a Markdown file under docs/projects: ${relativePath}`);
  }
  const absoluteRoot = path.resolve(root);
  const target = path.resolve(absoluteRoot, normalized);
  const allowedRoot = path.resolve(absoluteRoot, "docs/projects");
  if (target !== allowedRoot && !target.startsWith(`${allowedRoot}${path.sep}`)) {
    throw new Error(`Export path escaped docs/projects: ${relativePath}`);
  }
  return { normalized, target };
}

async function readOptional(filePath: string) {
  try {
    return await readFile(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function readManifest(filePath: string): Promise<ExportManifest | null> {
  const content = await readOptional(filePath);
  if (!content) return null;
  const parsed = JSON.parse(content.toString("utf8")) as ExportManifest;
  if (parsed.version !== 1 || !Array.isArray(parsed.files)) {
    throw new Error(`Unsupported export manifest: ${filePath}`);
  }
  return parsed;
}

async function atomicWrite(filePath: string, content: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.goodz-${randomUUID()}.tmp`;
  await writeFile(temporaryPath, content, "utf8");
  await rename(temporaryPath, filePath);
}

async function assertNoSymlinkPath(root: string, target: string) {
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`Write target escaped workspace: ${target}`);
  const segments = relative.split(path.sep).filter(Boolean);
  let current = root;
  for (const segment of segments) {
    current = path.join(current, segment);
    try {
      const metadata = await lstat(current);
      if (metadata.isSymbolicLink()) throw new Error(`Symbolic links are not allowed in export paths: ${path.relative(root, current)}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
      throw error;
    }
  }
}

export async function materializeProjectBundle(
  bundle: ProcessProjectExportBundle,
  options: MaterializeOptions,
): Promise<MaterializeResult> {
  if (bundle.schemaVersion !== 1 || !bundle.projectId || bundle.files.length === 0) {
    throw new Error("Unsupported or empty Goodz export bundle");
  }
  const root = path.resolve(options.root);
  const manifestPath = path.join(root, ".goodz/exports", manifestFileName(bundle.projectId));
  await assertNoSymlinkPath(root, manifestPath);
  const previousManifest = await readManifest(manifestPath);
  const previousHashes = new Map(previousManifest?.files.map((file) => [file.path, file.sha256]) ?? []);
  const planned = bundle.files.map((file) => {
    if (file.mediaType !== "text/markdown") throw new Error(`Unsupported media type: ${file.mediaType}`);
    const resolved = resolveExportPath(root, file.path);
    return { ...resolved, content: file.content, nextHash: sha256(file.content) };
  });
  if (new Set(planned.map((file) => file.normalized)).size !== planned.length) {
    throw new Error("Export bundle contains duplicate file paths");
  }

  const conflicts: string[] = [];
  const written: string[] = [];
  const skipped: string[] = [];
  for (const file of planned) {
    await assertNoSymlinkPath(root, file.target);
    const current = await readOptional(file.target);
    if (!current) {
      written.push(file.normalized);
      continue;
    }
    const currentHash = sha256(current);
    if (currentHash === file.nextHash) {
      skipped.push(file.normalized);
      continue;
    }
    const previousHash = previousHashes.get(file.normalized);
    if (!options.force && currentHash !== previousHash) {
      conflicts.push(file.normalized);
      continue;
    }
    written.push(file.normalized);
  }
  if (conflicts.length > 0) throw new MaterializationConflictError(conflicts);

  if (!options.dryRun) {
    for (const file of planned) {
      if (written.includes(file.normalized)) await atomicWrite(file.target, file.content);
    }
    const manifest: ExportManifest = {
      version: 1,
      projectId: bundle.projectId,
      bundleGeneratedAt: bundle.generatedAt,
      exportedAt: new Date().toISOString(),
      files: planned.map((file) => ({ path: file.normalized, sha256: file.nextHash })),
    };
    await atomicWrite(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  return {
    projectId: bundle.projectId,
    manifestPath: path.relative(root, manifestPath),
    written,
    skipped,
    dryRun: options.dryRun ?? false,
  };
}

export async function verifyMaterializedExports(root: string) {
  const manifestRoot = path.resolve(root, ".goodz/exports");
  try {
    await stat(manifestRoot);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { manifests: 0, files: 0 };
    throw error;
  }
  const { readdir } = await import("node:fs/promises");
  const names = (await readdir(manifestRoot)).filter((name) => name.endsWith(".json"));
  let fileCount = 0;
  for (const name of names) {
    const manifest = await readManifest(path.join(manifestRoot, name));
    if (!manifest) continue;
    for (const file of manifest.files) {
      const resolved = resolveExportPath(root, file.path);
      await assertNoSymlinkPath(path.resolve(root), resolved.target);
      const content = await readOptional(resolved.target);
      if (!content) throw new Error(`Materialized export is missing: ${file.path}`);
      if (sha256(content) !== file.sha256) throw new Error(`Materialized export was changed after export: ${file.path}`);
      fileCount += 1;
    }
  }
  return { manifests: names.length, files: fileCount };
}
