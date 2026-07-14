import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const statusPath = resolve(root, "references/goodz-internal/status.json");
const metricsSnapshotsPath = resolve(root, "references/goodz-internal/metrics-snapshots.json");
const status = JSON.parse(readFileSync(statusPath, "utf8"));
const metricsSnapshots = existsSync(metricsSnapshotsPath)
  ? JSON.parse(readFileSync(metricsSnapshotsPath, "utf8"))
  : null;

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

function assertOptionalTimestamp(value, owner) {
  if (value === undefined) return;
  assert(typeof value === "string" && value.length > 0, `${owner} timestamp must be a string`);
  assert(!Number.isNaN(Date.parse(value)), `${owner} timestamp is invalid: ${value}`);
}

const itemStatuses = new Set(["done", "in_progress", "pending", "blocked"]);
const traceStatuses = new Set(["pending", "partial", "linked", "released"]);
const refStatuses = new Set(["pending", "linked", "not_required"]);
const ciStatuses = new Set(["success", "failed", "running", "pending"]);
const smokeStatuses = new Set(["passed", "failed", "pending", "not_required"]);
const approvalStatuses = new Set(["approved", "requested", "changes_requested"]);
const approvalTypes = new Set(["phase_gate", "sprint", "deliverable", "change", "release"]);
const designReferenceCategories = new Set(["foundation", "component", "pattern", "commerce", "accessibility"]);
const wireframeFidelities = new Set(["low", "mid", "high"]);

assert(status.version >= 3, "status.version must be >= 3");
assert(typeof status.systemVersion === "string", "systemVersion is required");
assertArray(status.phases, "phases");
assertArray(status.intakes, "intakes");
assertArray(status.deliverables, "deliverables");
assertArray(status.approvals, "approvals");
assertArray(status.planningChanges, "planningChanges");
assertArray(status.designReferences, "designReferences");
assertArray(status.wireframes, "wireframes");
assertArray(status.storyboards, "storyboards");
assertArray(status.traceLinks, "traceLinks");

const intakes = new Set(status.intakes.map((item) => item.id));
const changes = new Set(status.planningChanges.map((item) => item.id));
const deliverables = new Set(status.deliverables.map((item) => item.id));
const approvals = new Set(status.approvals.map((item) => item.id));
const designReferences = new Set(status.designReferences.map((item) => item.id));
const wireframes = new Set(status.wireframes.map((item) => item.id));

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

for (const reference of status.designReferences) {
  assert(designReferenceCategories.has(reference.category), `${reference.id} has invalid design reference category`);
  assert(itemStatuses.has(reference.status), `${reference.id} has invalid status`);
  assert(typeof reference.url === "string" && reference.url.startsWith("https://"), `${reference.id} url must be https`);
  assertArray(reference.takeaways, `${reference.id}.takeaways`);
  assertArray(reference.applyTo, `${reference.id}.applyTo`);
  assert(reference.takeaways.length > 0, `${reference.id} needs at least one takeaway`);
  assert(reference.applyTo.length > 0, `${reference.id} needs at least one applyTo item`);
  assertDocExists(reference.doc, reference.id);
}

for (const wireframe of status.wireframes) {
  assert(wireframeFidelities.has(wireframe.fidelity), `${wireframe.id} has invalid fidelity`);
  assert(itemStatuses.has(wireframe.status), `${wireframe.id} has invalid status`);
  assertArray(wireframe.references, `${wireframe.id}.references`);
  for (const id of wireframe.references) {
    assert(designReferences.has(id), `${wireframe.id} references missing design reference ${id}`);
  }
  assertDocExists(wireframe.doc, wireframe.id);
}

for (const storyboard of status.storyboards) {
  assert(itemStatuses.has(storyboard.status), `${storyboard.id} has invalid status`);
  assertArray(storyboard.steps, `${storyboard.id}.steps`);
  assertArray(storyboard.linkedWireframes, `${storyboard.id}.linkedWireframes`);
  assert(storyboard.steps.length > 0, `${storyboard.id} needs at least one step`);
  for (const id of storyboard.linkedWireframes) {
    assert(wireframes.has(id), `${storyboard.id} references missing wireframe ${id}`);
  }
  assertDocExists(storyboard.doc, storyboard.id);
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
    for (const field of ["createdAt", "updatedAt", "closedAt", "mergedAt", "publishedAt"]) {
      assertOptionalTimestamp(ref[field], `${trace.id}.${refName}.${field}`);
    }
  }

  if (trace.status === "linked" || trace.status === "released") {
    assert(trace.commits.length > 0, `${trace.id} linked trace needs at least one commit`);
    assert(trace.ciRuns.length > 0, `${trace.id} linked trace needs at least one CI run`);
  }

  for (const commit of trace.commits) {
    assert(/^[a-f0-9]{7,40}$/.test(commit.sha), `${trace.id} invalid commit sha ${commit.sha}`);
    assert(commit.url.startsWith("https://github.com/"), `${trace.id} commit url must be GitHub`);
    assertOptionalTimestamp(commit.committedAt, `${trace.id}.commits[].committedAt`);
  }

  for (const run of trace.ciRuns) {
    assert(ciStatuses.has(run.status), `${trace.id} invalid CI status ${run.status}`);
    assert(run.url.startsWith("https://github.com/"), `${trace.id} CI url must be GitHub`);
    assertOptionalTimestamp(run.createdAt, `${trace.id}.ciRuns[].createdAt`);
    assertOptionalTimestamp(run.startedAt, `${trace.id}.ciRuns[].startedAt`);
    assertOptionalTimestamp(run.completedAt, `${trace.id}.ciRuns[].completedAt`);
  }

  if (trace.smoke) {
    assert(smokeStatuses.has(trace.smoke.status), `${trace.id} invalid smoke status ${trace.smoke.status}`);
    assert(typeof trace.smoke.command === "string" && trace.smoke.command.length > 0, `${trace.id}.smoke.command is required`);
    assert(typeof trace.smoke.summary === "string" && trace.smoke.summary.length > 0, `${trace.id}.smoke.summary is required`);
    assertOptionalTimestamp(trace.smoke.checkedAt, `${trace.id}.smoke.checkedAt`);
    if (trace.smoke.url) {
      assert(trace.smoke.url.startsWith("https://") || trace.smoke.url.startsWith("http://localhost:"), `${trace.id}.smoke.url must be https or localhost`);
    }
  }
}

const traceIds = new Set(status.traceLinks.map((item) => item.id));
for (const approval of status.approvals) {
  for (const id of approval.traceLinkIds) {
    assert(traceIds.has(id), `${approval.id} references missing trace link ${id}`);
  }
}

if (metricsSnapshots) {
  assert(metricsSnapshots.version >= 1, "metricsSnapshots.version must be >= 1");
  assertOptionalTimestamp(metricsSnapshots.updatedAt, "metricsSnapshots.updatedAt");
  assertArray(metricsSnapshots.snapshots, "metricsSnapshots.snapshots");

  for (const snapshot of metricsSnapshots.snapshots) {
    assert(typeof snapshot.id === "string" && snapshot.id.startsWith("MS-"), `${snapshot.id} invalid snapshot id`);
    assertOptionalTimestamp(snapshot.capturedAt, `${snapshot.id}.capturedAt`);
    assert(snapshot.source && typeof snapshot.source.systemVersion === "string", `${snapshot.id}.source.systemVersion is required`);
    assertOptionalTimestamp(snapshot.source.statusUpdatedAt, `${snapshot.id}.source.statusUpdatedAt`);
    assert(snapshot.totals && typeof snapshot.totals.traceCount === "number", `${snapshot.id}.totals.traceCount is required`);
    assert(snapshot.delivery && typeof snapshot.delivery.deploymentFrequency === "number", `${snapshot.id}.delivery.deploymentFrequency is required`);

    for (const field of ["leadTimeHours", "ciSuccessRate", "smokePassRate", "mttrHours"]) {
      assert(
        snapshot.delivery[field] === null || typeof snapshot.delivery[field] === "number",
        `${snapshot.id}.delivery.${field} must be number or null`,
      );
    }

    for (const field of ["changeFailureRate", "traceCoverage", "evidenceCompleteness"]) {
      assert(typeof snapshot.delivery[field] === "number", `${snapshot.id}.delivery.${field} must be number`);
    }
  }
}

console.log("process status ok");
