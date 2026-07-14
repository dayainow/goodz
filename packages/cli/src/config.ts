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
  platform: {
    modelPackage: "@goodz/process";
    consoleApp: string;
    apiPrefix: "/api/process";
    sourceOfTruth: string;
    internalReference?: { id: string; name: string; statusPath: string; metricsPath: string };
  };
  references: Array<{ id: string; name: string; domain: string; typePackage: string; apps: string[]; apiPrefix: string }>;
  portability: {
    coreChangesAllowedForNewReference: false;
    coreContract: { version: string; path: string; sha256: string };
    requiredCommands: string[];
  };
  delivery?: {
    exportRoot: "docs/projects";
    manifestRoot: ".goodz/exports";
    git: { remote: string; base: string; branchPrefix: string };
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

async function writeTextIfMissing(filePath: string, content: string) {
  try {
    await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, content, "utf8");
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
    version: 2,
    product: {
      name: "Goodz",
      edition: "core",
      description: `${projectName}의 기획부터 배포까지 연결하는 풀프로세스 운영 시스템`,
    },
    platform: {
      modelPackage: "@goodz/process",
      consoleApp: "apps/process-dashboard",
      apiPrefix: "/api/process",
      sourceOfTruth: "operations-db",
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
    delivery: {
      exportRoot: "docs/projects",
      manifestRoot: ".goodz/exports",
      git: { remote: "origin", base: "main", branchPrefix: "goodz/" },
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

async function writeWorkspaceIdentity(root: string, projectName: string) {
  const workspacePath = path.join(root, ".goodz/workspace.json");
  const existing = await readJsonOptional<unknown>(workspacePath);
  if (!existing) {
    await atomicJson(workspacePath, {
      version: 1,
      id: `WS-${randomUUID().slice(0, 8).toUpperCase()}`,
      name: projectName,
      createdAt: new Date().toISOString(),
      storage: { engine: "sqlite", path: ".goodz/data/goodz.db" },
    });
  }
  const dataIgnorePath = path.join(root, ".goodz/data/.gitignore");
  await mkdir(path.dirname(dataIgnorePath), { recursive: true });
  if (!(await readJsonOptional<Record<string, unknown>>(workspacePath))) {
    throw new Error("Failed to create .goodz/workspace.json");
  }
  await writeTextIfMissing(dataIgnorePath, "*.db\n*.db-*\n");
  await writeTextIfMissing(
    path.join(root, "docs/00-process/README.md"),
    `# ${projectName} Process Workspace\n\nGoodz가 이 프로젝트의 기획 → 디자인 → 개발 → QA → 배포 기록을 관리합니다.\n\n- 실행 상태와 감사 이력: \`.goodz/data/goodz.db\`\n- 승인 산출물: \`docs/projects/\`\n- Goodz 자체 개발 이력은 이 Workspace에 포함되지 않습니다.\n`,
  );
  await writeTextIfMissing(
    path.join(root, "docs/projects/README.md"),
    "# Project Deliverables\n\n승인된 PRD, Design Pack과 handoff 문서는 `goodz export`가 프로젝트별 디렉터리에 생성합니다.\n",
  );
  const processDocs = [
    {
      name: "USER_MANUAL.md",
      content: `# ${projectName} Goodz 이용 매뉴얼\n\n1. Dashboard의 Workspace에서 첫 프로젝트를 생성합니다.\n2. PRD와 Design Pack을 승인합니다.\n3. 현재 Stage의 Task·산출물·Evidence를 완료하고 Gate를 결정합니다.\n4. 승인 결과는 \`goodz export\`로 \`docs/projects/\`에 생성합니다.\n\nGoodz 자체 개발 이력은 이 Workspace에 포함되지 않습니다.\n`,
    },
    {
      name: "AGENT_GUIDE.md",
      content: "# Agent Guide\n\n에이전트는 현재 Stage를 건너뛰지 않고 PRD·디자인·코드·QA·배포 산출물을 프로젝트 ID와 연결합니다. 변경 완료 전 저장소 검증 명령을 실행하고 생성 파일을 검토합니다.\n",
    },
    {
      name: "WORKFLOW.md",
      content: "# Workflow\n\n```text\nP0 기획 → P1 디자인 → P2 개발 → P3 QA → P4 배포\n```\n\n각 Gate는 현재 Stage의 Task 완료와 필수 산출물 승인을 요구합니다. GO는 다음 Stage를 시작하고 HOLD는 차단하며 KILL은 실행을 종료합니다.\n",
    },
    {
      name: "METRICS.md",
      content: "# Delivery Metrics\n\n프로젝트별 lead time, Gate 대기 시간, CI 성공률, 배포·smoke 증거를 추적합니다. 지표는 사용자 Workspace의 Run과 Evidence에서 계산하며 Goodz 내부 지표와 섞지 않습니다.\n",
    },
    {
      name: "CICD.md",
      content: "# CI/CD 운영\n\nPR·Commit·CI·Release·Smoke URL을 현재 프로젝트 Stage의 Evidence로 연결합니다. 배포 전 저장소 검증과 필수 산출물 승인을 완료합니다.\n",
    },
  ];
  for (const doc of processDocs) {
    await writeTextIfMissing(path.join(root, "docs/00-process", doc.name), doc.content);
  }
  return workspacePath;
}

export async function initializeGoodz(root: string, projectName: string, force = false) {
  const absoluteRoot = path.resolve(root);
  const config = buildConfig(projectName, []);
  const configPath = await writeGoodzConfig(absoluteRoot, config, force);
  const workspacePath = await writeWorkspaceIdentity(absoluteRoot, projectName);
  return { root: absoluteRoot, configPath, workspacePath };
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
    warnings.push("No application package was detected; Goodz will start with an empty Workspace.");
  }
  if (!discovered.some((item) => item.path === "packages/process")) {
    warnings.push("Goodz Core source is not installed; verify will use the package-level contract only.");
  }
  const config = buildConfig(projectName, references);
  const configPath = path.join(absoluteRoot, "goodz.config.json");
  if (apply) {
    await writeGoodzConfig(absoluteRoot, config, force);
    await writeWorkspaceIdentity(absoluteRoot, projectName);
  }
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
  if ((config.version !== 1 && config.version !== 2) || config.product?.name !== "Goodz") throw new Error("Unsupported Goodz config version or product");
  if (config.platform?.modelPackage !== "@goodz/process" || config.platform.apiPrefix !== "/api/process") throw new Error("Invalid Goodz platform contract");
  if (!Array.isArray(config.references)) throw new Error("Goodz references must be an array");
  if (config.portability?.coreChangesAllowedForNewReference !== false) throw new Error("Core changes must be disabled for new References");
  if (!/^[a-f0-9]{64}$/.test(config.portability.coreContract.sha256)) throw new Error("Invalid Core contract hash");
  if (config.version === 2 && (
    config.delivery?.exportRoot !== "docs/projects" ||
    config.delivery.manifestRoot !== ".goodz/exports" ||
    !config.delivery.git?.remote ||
    !config.delivery.git.base ||
    !config.delivery.git.branchPrefix
  )) throw new Error("Invalid Goodz delivery configuration");
}

export async function migrateGoodzConfig(root: string, dryRun = false) {
  const absoluteRoot = path.resolve(root);
  const configPath = path.join(absoluteRoot, "goodz.config.json");
  const config = JSON.parse(await readFile(configPath, "utf8")) as unknown;
  assertConfig(config);
  if (config.version === 2) return { configPath, from: 2, to: 2, changed: false, dryRun };
  const migrated: GoodzConfig = {
    ...config,
    version: 2,
    delivery: {
      exportRoot: "docs/projects",
      manifestRoot: ".goodz/exports",
      git: { remote: "origin", base: "main", branchPrefix: "goodz/" },
    },
  };
  if (!dryRun) await atomicJson(configPath, migrated);
  return { configPath, from: 1, to: 2, changed: true, dryRun };
}

export async function verifyGoodzWorkspace(root: string) {
  const absoluteRoot = path.resolve(root);
  const configPath = path.join(absoluteRoot, "goodz.config.json");
  const config = JSON.parse(await readFile(configPath, "utf8")) as unknown;
  assertConfig(config);
  const warnings: string[] = [];
  if (config.version === 1) warnings.push("Goodz config v1 is supported but should be upgraded with goodz config migrate.");
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
