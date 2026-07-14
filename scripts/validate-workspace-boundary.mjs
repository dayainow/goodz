import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relativePath) => JSON.parse(readFileSync(resolve(root, relativePath), "utf8"));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const config = readJson("goodz.config.json");
const workspace = readJson(".goodz/workspace.json");
const schema = readJson("schemas/goodz-config.schema.json");
const reference = config.platform?.internalReference;

assert(config.platform?.sourceOfTruth === "operations-db", "user runtime sourceOfTruth must be operations-db");
assert(reference?.statusPath === "references/goodz-internal/status.json", "Goodz status must live under the internal Reference");
assert(reference?.metricsPath === "references/goodz-internal/metrics-snapshots.json", "Goodz metrics must live under the internal Reference");
assert(existsSync(resolve(root, reference.statusPath)), "Goodz internal status is missing");
assert(existsSync(resolve(root, reference.metricsPath)), "Goodz internal metrics are missing");
assert(!existsSync(resolve(root, "docs/00-process/status.json")), "legacy Goodz status must not remain in user process docs");
assert(!existsSync(resolve(root, "docs/00-process/metrics-snapshots.json")), "legacy Goodz metrics must not remain in user process docs");
assert(workspace.name === "Goodz Product Development", "Goodz source repository must identify its internal Workspace");
assert(schema.properties?.references?.minItems === undefined, "new Workspaces must allow zero References");

console.log("workspace boundary ok: empty user runtime + optional Goodz internal Reference");
