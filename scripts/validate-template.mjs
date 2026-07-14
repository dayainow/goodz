import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const config = readJson("template.config.json");
const productConfig = readJson("goodz.config.json");
const rootPackage = readJson("package.json");

assert(config.version >= 1, "template config version must be >= 1");
assert(config.packageManager === "pnpm", "template package manager must be pnpm");
assert(rootPackage.packageManager?.startsWith("pnpm@"), "package.json must pin pnpm");
assert(productConfig.product?.name === "Goodz", "product name must remain Goodz");
assert(
  productConfig.platform?.modelPackage === "@goodz/process",
  "platform model package must be @goodz/process",
);
assert(
  productConfig.platform?.apiPrefix === "/api/process",
  "platform API prefix must be /api/process",
);
assert(
  productConfig.portability?.coreChangesAllowedForNewReference === false,
  "new references must not require Goodz Core changes",
);

for (const boundary of ["platform", "reference"]) {
  const paths = config.boundaries?.[boundary];
  assert(Array.isArray(paths) && paths.length > 0, `${boundary} boundary is empty`);
  for (const path of paths) {
    assert(existsSync(resolve(root, path)), `${boundary} boundary path is missing: ${path}`);
  }
}

for (const script of config.requiredScripts) {
  assert(rootPackage.scripts?.[script], `required root script is missing: ${script}`);
}

for (const path of [...config.requiredPaths, ...config.envExamples]) {
  assert(existsSync(resolve(root, path)), `template path is missing: ${path}`);
}

for (const item of config.customize) {
  assert(item.id && item.label, "customize entries need id and label");
  assert(Array.isArray(item.docs) && item.docs.length > 0, `${item.id} needs docs`);
  for (const path of item.docs) {
    assert(existsSync(resolve(root, path)), `${item.id} customization doc is missing: ${path}`);
  }
}

const packagePaths = [
  "package.json",
  "apps/landing/package.json",
  "apps/api-server/package.json",
  "apps/web-shop/package.json",
  "apps/admin-dashboard/package.json",
  "apps/process-dashboard/package.json",
  "packages/process/package.json",
  "packages/types/package.json",
  "packages/ui/package.json",
  "packages/tsconfig/package.json",
  "references/internal-service/apps/api/package.json",
  "references/internal-service/packages/types/package.json",
];

for (const path of packagePaths) {
  const pkg = readJson(path);
  for (const field of ["dependencies", "devDependencies", "optionalDependencies"]) {
    for (const [name, spec] of Object.entries(pkg[field] ?? {})) {
      if (!String(spec).startsWith("file:")) continue;
      const target = resolve(root, dirname(path), String(spec).slice(5));
      const fromRoot = relative(root, target);
      assert(!fromRoot.startsWith("..") && !isAbsolute(fromRoot), `${path} has a non-portable local dependency: ${name}=${spec}`);
    }
  }
}

const processTemplatePaths = readdirSync(resolve(root, "templates/process"))
  .filter((file) => file.endsWith(".json"))
  .map((file) => `templates/process/${file}`);
assert(processTemplatePaths.length >= 2, "P0-P4 and Phase 0-8 process templates are required");
for (const path of processTemplatePaths) {
  const template = readJson(path);
  assert(template.id && template.name && template.summary, `${path} requires id, name, and summary`);
  assert(Number.isInteger(template.version) && template.version > 0, `${path} requires a positive version`);
  assert(Array.isArray(template.stages) && template.stages.length > 0, `${path} requires stages`);
  const stageCodes = new Set();
  for (const stage of template.stages) {
    assert(/^[A-Z][A-Z0-9_-]{0,15}$/.test(stage.code), `${path} has invalid stage code: ${stage.code}`);
    assert(!stageCodes.has(stage.code), `${path} has duplicate stage code: ${stage.code}`);
    stageCodes.add(stage.code);
    assert(stage.name && stage.summary, `${path} stage ${stage.code} requires name and summary`);
    assert(Array.isArray(stage.tasks) && stage.tasks.length > 0, `${path} stage ${stage.code} requires tasks`);
    assert(Array.isArray(stage.deliverables), `${path} stage ${stage.code} requires deliverables`);
  }
}
const phase08 = readJson("templates/process/service-delivery-phase-0-8.json");
assert(phase08.stages.length === 9, "Phase 0-8 template must contain exactly 9 stages");

console.log(`template contract ok (${processTemplatePaths.length} process templates)`);
