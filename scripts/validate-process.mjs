import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const statusPath = resolve(root, "docs/00-process/status.json");
const status = JSON.parse(readFileSync(statusPath, "utf8"));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertArray(value, field) {
  assert(Array.isArray(value), `${field} must be an array`);
}

function assertDocExists(doc, owner) {
  assert(typeof doc === "string" && doc.length > 0, `${owner} doc is required`);
  assert(existsSync(resolve(root, doc)), `${owner} doc not found: ${doc}`);
}

const itemStatuses = new Set(["done", "in_progress", "pending", "blocked"]);
const traceStatuses = new Set(["pending", "partial", "linked", "released"]);
const refStatuses = new Set(["pending", "linked", "not_required"]);
const ciStatuses = new Set(["success", "failed", "running", "pending"]);
const approvalStatuses = new Set(["approved", "requested", "changes_requested"]);
const approvalTypes = new Set(["phase_gate", "sprint", "deliverable", "change", "release"]);

assert(status.version >= 3, "status.version must be >= 3");
assert(typeof status.systemVersion === "string", "systemVersion is required");
assertArray(status.phases, "phases");
assertArray(status.intakes, "intakes");
assertArray(status.deliverables, "deliverables");
assertArray(status.approvals, "approvals");
assertArray(status.planningChanges, "planningChanges");
assertArray(status.traceLinks, "traceLinks");

const intakes = new Set(status.intakes.map((item) => item.id));
const changes = new Set(status.planningChanges.map((item) => item.id));
const deliverables = new Set(status.deliverables.map((item) => item.id));
const approvals = new Set(status.approvals.map((item) => item.id));

for (const phase of status.phases) {
  assert(itemStatuses.has(phase.status), `${phase.id} has invalid status`);
  assertArray(phase.items, `${phase.id}.items`);
  for (const item of phase.items) {
    assert(itemStatuses.has(item.status), `${phase.id}.${item.id} has invalid status`);
    if (item.doc) assertDocExists(item.doc, `${phase.id}.${item.id}`);
  }
}

for (const intake of status.intakes) {
  assert(itemStatuses.has(intake.status), `${intake.id} has invalid status`);
  assertDocExists(intake.doc, intake.id);
}

for (const deliverable of status.deliverables) {
  assert(itemStatuses.has(deliverable.status), `${deliverable.id} has invalid status`);
  assertDocExists(deliverable.doc, deliverable.id);
}

for (const change of status.planningChanges) {
  assertDocExists(change.doc, change.id);
  assertArray(change.targetDocs, `${change.id}.targetDocs`);
  for (const doc of change.targetDocs) {
    assertDocExists(doc, `${change.id}.targetDocs`);
  }
}

for (const approval of status.approvals) {
  assert(approvalStatuses.has(approval.status), `${approval.id} has invalid approval status`);
  assert(approvalTypes.has(approval.type), `${approval.id} has invalid approval type`);
  assert(typeof approval.driver === "string" && approval.driver.length > 0, `${approval.id} driver is required`);
  assert(typeof approval.approver === "string" && approval.approver.length > 0, `${approval.id} approver is required`);
  assertArray(approval.contributors, `${approval.id}.contributors`);
  assertArray(approval.informed, `${approval.id}.informed`);
  assertArray(approval.criteria, `${approval.id}.criteria`);
  assertArray(approval.traceLinkIds, `${approval.id}.traceLinkIds`);
  assert(approval.criteria.length > 0, `${approval.id} needs at least one criterion`);
  assert(typeof approval.decision === "string" && approval.decision.length > 0, `${approval.id} decision is required`);
  assertDocExists(approval.doc, approval.id);
}

for (const trace of status.traceLinks) {
  assert(traceStatuses.has(trace.status), `${trace.id} has invalid trace status`);
  assertArray(trace.sourceIds, `${trace.id}.sourceIds`);
  assertArray(trace.changeIds, `${trace.id}.changeIds`);
  assertArray(trace.deliverableIds, `${trace.id}.deliverableIds`);
  assertArray(trace.approvalIds, `${trace.id}.approvalIds`);
  assertArray(trace.commits, `${trace.id}.commits`);
  assertArray(trace.ciRuns, `${trace.id}.ciRuns`);

  for (const id of trace.sourceIds) {
    assert(intakes.has(id), `${trace.id} references missing intake ${id}`);
  }
  for (const id of trace.changeIds) {
    assert(changes.has(id), `${trace.id} references missing change ${id}`);
  }
  for (const id of trace.deliverableIds) {
    assert(deliverables.has(id), `${trace.id} references missing deliverable ${id}`);
  }
  for (const id of trace.approvalIds) {
    assert(approvals.has(id), `${trace.id} references missing approval ${id}`);
  }

  for (const refName of ["issue", "pr", "release"]) {
    const ref = trace[refName];
    assert(ref && refStatuses.has(ref.status), `${trace.id}.${refName} has invalid status`);
    if (ref.status === "linked") {
      assert(typeof ref.url === "string" && ref.url.startsWith("https://"), `${trace.id}.${refName} linked ref needs https url`);
    }
  }

  if (trace.status === "linked" || trace.status === "released") {
    assert(trace.commits.length > 0, `${trace.id} linked trace needs at least one commit`);
    assert(trace.ciRuns.length > 0, `${trace.id} linked trace needs at least one CI run`);
  }

  for (const commit of trace.commits) {
    assert(/^[a-f0-9]{7,40}$/.test(commit.sha), `${trace.id} invalid commit sha ${commit.sha}`);
    assert(commit.url.startsWith("https://github.com/"), `${trace.id} commit url must be GitHub`);
  }

  for (const run of trace.ciRuns) {
    assert(ciStatuses.has(run.status), `${trace.id} invalid CI status ${run.status}`);
    assert(run.url.startsWith("https://github.com/"), `${trace.id} CI url must be GitHub`);
  }
}

const traceIds = new Set(status.traceLinks.map((item) => item.id));
for (const approval of status.approvals) {
  for (const id of approval.traceLinkIds) {
    assert(traceIds.has(id), `${approval.id} references missing trace link ${id}`);
  }
}

console.log("process status ok");
