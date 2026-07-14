import {
  createProcessProject,
  createProcessEvidence,
  createProcessTemplate,
  createIncident,
  decideProcessGate,
  loadOperationsOverview,
  loadProcessWorkspace,
  resolveIncident,
  updateProcessStage,
  updateProcessDeliverable,
  updateProcessTask,
} from "../data/operationsStore.js";

const before = loadOperationsOverview();
if (before.storage.engine !== "sqlite" || before.storage.schemaVersion !== 3) {
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

const workspace = loadProcessWorkspace();
const template = workspace.templates.find((item) => item.id === "TPL-GOODZ-P0-P4-V1");
const phase08Template = workspace.templates.find((item) => item.id === "TPL-SERVICE-P0-P8-V1");
if (!template || template.stages.length !== 5 || !phase08Template || phase08Template.stages.length !== 9) {
  throw new Error("File-based P0-P4 and Phase 0-8 templates are not ready");
}
if (phase08Template.stages[0]?.code !== "P0" || phase08Template.stages[8]?.code !== "P8") {
  throw new Error("Template stage codes are not exposed for visual cloning");
}

let invalidTemplateRejected = false;
try {
  createProcessTemplate({
    name: "Invalid visual template",
    summary: "duplicate stage code must be rejected",
    stages: [
      { code: "P0", name: "One", summary: "first", tasks: [{ title: "Task", summary: "Task summary" }], deliverables: [] },
      { code: "P0", name: "Two", summary: "second", tasks: [{ title: "Task", summary: "Task summary" }], deliverables: [] },
    ],
  });
} catch {
  invalidTemplateRejected = true;
}
if (!invalidTemplateRejected) {
  throw new Error("Duplicate stage codes were allowed");
}

const customTemplate = createProcessTemplate({
  name: "Validation template",
  summary: "verify SQLite Template Builder persistence",
  stages: [{
    code: "V0",
    name: "검증",
    summary: "custom template validation stage",
    tasks: [{ title: "검증 작업", summary: "complete validation" }],
    deliverables: [{ title: "검증 기록", summary: "validation evidence", required: true }],
  }],
});
if (customTemplate.stages.length !== 1 || customTemplate.stages[0]?.deliverables.length !== 1) {
  throw new Error("Template Builder persistence validation failed");
}

const createdProject = createProcessProject({
  name: "Writable process validation",
  summary: "verify project, task, and gate lifecycle",
  owner: "Goodz QA",
  templateId: template.id,
});
const firstStage = createdProject.run.stages[0];
if (!firstStage || firstStage.status !== "in_progress") {
  throw new Error("First process stage did not start");
}

let phaseSkipRejected = false;
try {
  updateProcessStage(createdProject.run.id, createdProject.run.stages[1]!.id, {
    status: "in_progress",
  });
} catch {
  phaseSkipRejected = true;
}
if (!phaseSkipRejected) {
  throw new Error("Non-current stage was allowed to start");
}

let run = createdProject.run;
for (const task of firstStage.tasks) {
  run = updateProcessTask(run.id, firstStage.id, task.id, {
    status: "done",
    assignee: "Goodz QA",
  });
}
let deliverableGuardRejected = false;
try {
  decideProcessGate(run.id, firstStage.id, {
    decision: "go",
    note: "must be rejected before deliverable approval",
  });
} catch {
  deliverableGuardRejected = true;
}
if (!deliverableGuardRejected) {
  throw new Error("GO was allowed before required deliverable approval");
}
const requiredDeliverable = firstStage.deliverables[0];
if (!requiredDeliverable) throw new Error("Required deliverable run was not created");
run = updateProcessDeliverable(run.id, firstStage.id, requiredDeliverable.id, {
  status: "approved",
  owner: "Goodz QA",
  uri: "docs/01-planning/PRD.md",
  note: "validation approved",
});
run = createProcessEvidence(run.id, firstStage.id, {
  type: "ci",
  label: "SQLite lifecycle",
  url: "https://example.com/ci/validation",
  summary: "verifies evidence submission",
});
if (run.stages[0]?.evidence.length !== 1) {
  throw new Error("Process evidence submission validation failed");
}
run = decideProcessGate(run.id, firstStage.id, {
  decision: "go",
  note: "P0 validation passed",
});
if (
  run.stages[0]?.status !== "done" ||
  run.stages[1]?.status !== "in_progress" ||
  run.currentStageId !== run.stages[1]?.id
) {
  throw new Error("GO decision did not advance the process run");
}

const validatedWorkspace = loadProcessWorkspace();
if (validatedWorkspace.projects.length !== 1 || validatedWorkspace.templates.length !== 3 || validatedWorkspace.auditEvents.length < 7) {
  throw new Error("Writable process audit validation failed");
}

console.log("sqlite template catalog, deliverable, evidence, and gate lifecycle ok");
