import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { verifyMaterializedExports } from "./materializer.js";

const packageMetadata = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
  goodzCoreContract: { version: string; sha256: string };
};
const CORE_VERSION = packageMetadata.goodzCoreContract.version;
const CORE_SHA256 = packageMetadata.goodzCoreContract.sha256;

interface GoodzConfig {
  version: number;
  product: { name: "Goodz"; edition: "core" | "cloud" | "enterprise"; description: string };
  platform: { modelPackage: "@goodz/process"; consoleApp: string; apiPrefix: "/api/process"; sourceOfTruth: string };
  references: Array<{ id: string; name: string; domain: string; typePackage: string; apps: string[]; apiPrefix: string }>;
  portability: {
    coreChangesAllowedForNewReference: false;
    coreContract: { version: string; path: string; sha256: string };
    requiredCommands: string[];
  };
}

interface PackageMetadata {
  name?: string;
  packageManager?: string;
}

export interface GoodzAdoptionPlan {
  root: string;
  projectName: string;
  packageManager: string;
  configPath: string;
  references: GoodzConfig["references"];
  warnings: string[];
  applied: boolean;
}

function slugify(value: string) {
  const slug = value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "product";
}

async function atomicJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.goodz-${randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

async function readJsonOptional<T>(filePath: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function toDisplayName(value: string) {
  return value
    .replace(/^@[^/]+\//, "")
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

async function collectPackageMetadata(root: string, directory: string, depth = 0): Promise<Array<{ path: string; metadata: PackageMetadata }>> {
  if (depth > 4) return [];
  const absolute = path.join(root, directory);
  let entries;
  try {
    entries = await readdir(absolute, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const packages: Array<{ path: string; metadata: PackageMetadata }> = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name.startsWith(".")) continue;
    const relative = path.posix.join(directory.replaceAll("\\", "/"), entry.name);
    if (entry.isDirectory()) {
      const metadata = await readJsonOptional<PackageMetadata>(path.join(root, relative, "package.json"));
      if (metadata) packages.push({ path: relative, metadata });
      else packages.push(...await collectPackageMetadata(root, relative, depth + 1));
    }
  }
  return packages;
}

function buildConfig(projectName: string, references: GoodzConfig["references"]): GoodzConfig {
  return {
    version: 1,
    product: {
      name: "Goodz",
      edition: "core",
      description: `${projectName}의 기획부터 배포까지 연결하는 풀프로세스 운영 시스템`,
    },
    platform: {
      modelPackage: "@goodz/process",
      consoleApp: "apps/process-dashboard",
      apiPrefix: "/api/process",
      sourceOfTruth: "docs/00-process/status.json",
    },
    references,
    portability: {
      coreChangesAllowedForNewReference: false,
      coreContract: {
        version: CORE_VERSION,
        path: "packages/process/src/index.ts",
        sha256: CORE_SHA256,
      },
      requiredCommands: ["pnpm goodz -- verify", "pnpm verify"],
    },
  };
}

async function writeGoodzConfig(root: string, config: GoodzConfig, force: boolean) {
  const configPath = path.join(root, "goodz.config.json");
  const existing = await readJsonOptional<unknown>(configPath);
  if (existing && !force) throw new Error(`goodz.config.json already exists in ${root}`);
  await mkdir(path.join(root, "docs/projects"), { recursive: true });
  await mkdir(path.join(root, ".goodz/exports"), { recursive: true });
  await atomicJson(configPath, config);
  return configPath;
}

export async function initializeGoodz(root: string, projectName: string, force = false) {
  const absoluteRoot = path.resolve(root);
  const slug = slugify(projectName);
  const config = buildConfig(projectName, [{
      id: `${slug}-reference`,
      name: `${projectName} Reference`,
      domain: slug,
      typePackage: `@${slug}/types`,
      apps: ["apps/reference"],
      apiPrefix: "/api",
    }]);
  const configPath = await writeGoodzConfig(absoluteRoot, config, force);
  return { root: absoluteRoot, configPath };
}

export async function adoptGoodz(root: string, requestedName?: string, apply = false, force = false): Promise<GoodzAdoptionPlan> {
  const absoluteRoot = path.resolve(root);
  const rootPackage = await readJsonOptional<PackageMetadata>(path.join(absoluteRoot, "package.json"));
  if (!rootPackage) throw new Error(`package.json was not found in ${absoluteRoot}`);
  const projectName = requestedName ?? toDisplayName(rootPackage.name ?? path.basename(absoluteRoot));
  const discovered = [
    ...await collectPackageMetadata(absoluteRoot, "apps"),
    ...await collectPackageMetadata(absoluteRoot, "packages"),
    ...await collectPackageMetadata(absoluteRoot, "references"),
  ];
  const warnings: string[] = [];
  const topLevelApps = discovered.filter((item) => item.path.startsWith("apps/"));
  const topLevelTypes = discovered.find((item) => item.path.startsWith("packages/") && /(?:\/types|-types)$/.test(item.metadata.name ?? ""));
  const projectSlug = slugify(projectName);
  const references: GoodzConfig["references"] = [];
  if (topLevelApps.length > 0) {
    references.push({
      id: `${projectSlug}-reference`,
      name: `${projectName} Reference`,
      domain: projectSlug,
      typePackage: topLevelTypes?.metadata.name ?? `@${projectSlug}/types`,
      apps: topLevelApps.map((item) => item.path).sort(),
      apiPrefix: "/api",
    });
  }
  const referenceIds = [...new Set(discovered.flatMap((item) => {
    const match = item.path.match(/^references\/([^/]+)\/apps\//);
    return match?.[1] ? [match[1]] : [];
  }))].sort();
  for (const id of referenceIds) {
    const apps = discovered.filter((item) => item.path.startsWith(`references/${id}/apps/`));
    const types = discovered.find((item) => item.path.startsWith(`references/${id}/packages/`) && /(?:\/types|-types)$/.test(item.metadata.name ?? ""));
    references.push({
      id,
      name: `${toDisplayName(id)} Reference`,
      domain: id,
      typePackage: types?.metadata.name ?? `@${id}/types`,
      apps: apps.map((item) => item.path).sort(),
      apiPrefix: "/api",
    });
  }
  if (references.length === 0) {
    warnings.push("No application package was detected; a placeholder Reference was proposed.");
    references.push({
      id: `${projectSlug}-reference`,
      name: `${projectName} Reference`,
      domain: projectSlug,
      typePackage: `@${projectSlug}/types`,
      apps: ["apps/reference"],
      apiPrefix: "/api",
    });
  }
  if (!discovered.some((item) => item.path === "packages/process")) {
    warnings.push("Goodz Core source is not installed; verify will use the package-level contract only.");
  }
  const config = buildConfig(projectName, references);
  const configPath = path.join(absoluteRoot, "goodz.config.json");
  if (apply) await writeGoodzConfig(absoluteRoot, config, force);
  return {
    root: absoluteRoot,
    projectName,
    packageManager: rootPackage.packageManager?.split("@")[0] ?? "unknown",
    configPath,
    references,
    warnings,
    applied: apply,
  };
}

function assertConfig(value: unknown): asserts value is GoodzConfig {
  if (!value || typeof value !== "object") throw new Error("goodz.config.json must contain an object");
  const config = value as Partial<GoodzConfig>;
  if (config.version !== 1 || config.product?.name !== "Goodz") throw new Error("Unsupported Goodz config version or product");
  if (config.platform?.modelPackage !== "@goodz/process" || config.platform.apiPrefix !== "/api/process") throw new Error("Invalid Goodz platform contract");
  if (!Array.isArray(config.references) || config.references.length === 0) throw new Error("At least one Reference is required");
  if (config.portability?.coreChangesAllowedForNewReference !== false) throw new Error("Core changes must be disabled for new References");
  if (!/^[a-f0-9]{64}$/.test(config.portability.coreContract.sha256)) throw new Error("Invalid Core contract hash");
}

export async function verifyGoodzWorkspace(root: string) {
  const absoluteRoot = path.resolve(root);
  const configPath = path.join(absoluteRoot, "goodz.config.json");
  const config = JSON.parse(await readFile(configPath, "utf8")) as unknown;
  assertConfig(config);
  const warnings: string[] = [];
  const corePath = path.resolve(absoluteRoot, config.portability.coreContract.path);
  try {
    const core = await readFile(corePath);
    const actualHash = createHash("sha256").update(core).digest("hex");
    if (actualHash !== config.portability.coreContract.sha256) throw new Error("Core contract hash does not match goodz.config.json");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") warnings.push("Core source is not present; package-level contract verification was skipped.");
    else throw error;
  }
  const exports = await verifyMaterializedExports(absoluteRoot);
  return { configVersion: config.version, references: config.references.length, exports, warnings };
}
