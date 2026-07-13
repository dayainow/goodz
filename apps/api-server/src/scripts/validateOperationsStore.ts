import {
  createIncident,
  loadOperationsOverview,
  resolveIncident,
} from "../data/operationsStore.js";

const before = loadOperationsOverview();
if (before.storage.engine !== "sqlite" || before.storage.schemaVersion !== 1) {
  throw new Error("SQLite schema is not ready");
}
if (before.documents.indexed === 0) {
  throw new Error("Document index seed is empty");
}

const created = createIncident({
  title: "SQLite validation incident",
  severity: "low",
  summary: "verify create and resolve lifecycle",
});
const resolved = resolveIncident(created.id);
if (!resolved || resolved.status !== "resolved" || !resolved.resolvedAt) {
  throw new Error("Incident lifecycle validation failed");
}

const after = loadOperationsOverview();
if (after.incidents.resolved !== 1 || after.incidents.mttrHours === null) {
  throw new Error("Incident metrics validation failed");
}

console.log("sqlite operations store ok");
