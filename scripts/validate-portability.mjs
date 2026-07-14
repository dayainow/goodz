import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const referenceRoot = "references/internal-service";

function readJson(path) {
  return JSON.parse(readFileSync(resolve(root, path), "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function listFiles(path) {
  const absolute = resolve(root, path);
  return readdirSync(absolute).flatMap((name) => {
    if (name === "node_modules" || name === "dist") return [];
    const child = join(absolute, name);
    if (statSync(child).isDirectory()) {
      return listFiles(child.slice(root.length + 1));
    }
    return [child];
  });
}

const productConfig = readJson("goodz.config.json");
const coreContract = productConfig.portability?.coreContract;
assert(coreContract, "Goodz Core portability contract is missing");

const coreHash = createHash("sha256")
  .update(readFileSync(resolve(root, coreContract.path)))
  .digest("hex");

assert(
  coreHash === coreContract.sha256,
  `Goodz Core contract changed during portability proof: ${coreHash}`,
);

const reference = productConfig.references.find(
  (item) => item.id === "internal-service",
);
assert(reference, "internal-service reference is not registered in goodz.config.json");
assert(
  productConfig.portability?.coreChangesAllowedForNewReference === false,
  "Goodz portability policy must forbid Core changes for a new reference",
);

const manifest = readJson(`${referenceRoot}/goodz.reference.json`);
assert(manifest.coreChangesRequired === false, "reference requires Core changes");
assert(
  manifest.compatibleCore === coreContract.version,
  "reference Core version is not pinned",
);
assert(
  manifest.typePackage === "@goodz/internal-service-types",
  "reference type package is not isolated",
);

const phaseIds = ["P0", "P1", "P2", "P3", "P4"];
for (const phaseId of phaseIds) {
  const phase = manifest.phases.find((item) => item.id === phaseId);
  assert(phase?.status === "done", `${phaseId} is not complete`);
  assert(phase.artifacts.length > 0, `${phaseId} has no artifact`);
  for (const artifact of phase.artifacts) {
    assert(existsSync(resolve(root, artifact)), `${phaseId} artifact is missing: ${artifact}`);
  }
}

const typePackage = readJson(`${referenceRoot}/packages/types/package.json`);
const apiPackage = readJson(`${referenceRoot}/apps/api/package.json`);
assert(
  apiPackage.dependencies?.[manifest.typePackage] === "workspace:*",
  "reference API must depend on its own type package",
);

for (const packageJson of [typePackage, apiPackage]) {
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  assert(!dependencies["@goodz/types"], `${packageJson.name} depends on Commerce types`);
  assert(!dependencies["@goodz/process"], `${packageJson.name} modifies its domain through Core types`);
}

const source = listFiles(referenceRoot)
  .filter((path) => /\.ts$/.test(path))
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");
assert(
  !/\b(Product|Cart|Checkout)\b/.test(source),
  "non-commerce reference contains Commerce domain symbols",
);

console.log(`portability ok: ${manifest.name} on Goodz Core ${manifest.compatibleCore}`);
