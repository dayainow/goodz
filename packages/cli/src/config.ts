import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
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

export async function initializeGoodz(root: string, projectName: string, force = false) {
  const absoluteRoot = path.resolve(root);
  const configPath = path.join(absoluteRoot, "goodz.config.json");
  try {
    await readFile(configPath);
    if (!force) throw new Error(`goodz.config.json already exists in ${absoluteRoot}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const slug = slugify(projectName);
  const config: GoodzConfig = {
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
    references: [{
      id: `${slug}-reference`,
      name: `${projectName} Reference`,
      domain: slug,
      typePackage: `@${slug}/types`,
      apps: ["apps/reference"],
      apiPrefix: "/api",
    }],
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
  await mkdir(path.join(absoluteRoot, "docs/projects"), { recursive: true });
  await mkdir(path.join(absoluteRoot, ".goodz/exports"), { recursive: true });
  await atomicJson(configPath, config);
  return { root: absoluteRoot, configPath };
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
