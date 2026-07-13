import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const config = readJson("template.config.json");
const rootPackage = readJson("package.json");

assert(config.version >= 1, "template config version must be >= 1");
assert(config.packageManager === "pnpm", "template package manager must be pnpm");
assert(rootPackage.packageManager?.startsWith("pnpm@"), "package.json must pin pnpm");

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
  "apps/api-server/package.json",
  "apps/web-shop/package.json",
  "apps/admin-dashboard/package.json",
  "apps/process-dashboard/package.json",
  "packages/types/package.json",
  "packages/ui/package.json",
  "packages/tsconfig/package.json"
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

console.log("template contract ok");
