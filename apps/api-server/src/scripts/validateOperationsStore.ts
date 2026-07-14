import {
  createProcessProject,
  createIncident,
  decideProcessGate,
  loadOperationsOverview,
  loadProcessWorkspace,
  resolveIncident,
  updateProcessStage,
  updateProcessTask,
} from "../data/operationsStore.js";

const before = loadOperationsOverview();
if (before.storage.engine !== "sqlite" || before.storage.schemaVersion !== 2) {
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
const template = workspace.templates[0];
if (!template || template.stages.length !== 5) {
  throw new Error("Default P0-P4 process template is not ready");
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
if (validatedWorkspace.projects.length !== 1 || validatedWorkspace.auditEvents.length < 4) {
  throw new Error("Writable process audit validation failed");
}

console.log("sqlite operations store and writable process lifecycle ok");
