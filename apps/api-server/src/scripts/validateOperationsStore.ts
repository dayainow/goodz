import {
  createProcessProject,
  createProcessEvidence,
  createProcessTemplate,
  migrateProcessTemplate,
  updateProcessProjectBrief,
  approveProcessProjectBrief,
  updateProcessDesignPack,
  approveProcessDesignPack,
  createProcessDesignJob,
  startProcessDesignJob,
  submitProcessDesignJob,
  requestProcessDesignChanges,
  exportProcessProject,
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
if (before.storage.engine !== "sqlite" || before.storage.schemaVersion !== 5) {
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

const migratedTemplate = migrateProcessTemplate(template.id, {
  summary: "version 2 migration validation",
});
if (
  migratedTemplate.source.version !== 1 ||
  migratedTemplate.target.version !== 2 ||
  migratedTemplate.target.id !== "TPL-GOODZ-P0-P4-V2" ||
  migratedTemplate.target.stages.length !== migratedTemplate.source.stages.length ||
  migratedTemplate.source.summary === migratedTemplate.target.summary
) {
  throw new Error("Template version migration failed");
}
const migratedProject = createProcessProject({
  name: "Migrated template validation",
  summary: "verify new projects can use the migrated immutable template",
  owner: "Goodz QA",
  templateId: migratedTemplate.target.id,
});
if (migratedProject.run.templateVersion !== 2 || createdProject.run.templateVersion !== 1) {
  throw new Error("Template migration changed an existing run or failed to pin the new run");
}

let briefApprovalRejected = false;
try {
  approveProcessProjectBrief(createdProject.project.id);
} catch {
  briefApprovalRejected = true;
}
if (!briefApprovalRejected) throw new Error("Empty PRD was approved");

const brief = updateProcessProjectBrief(createdProject.project.id, {
  problem: "Teams lose product context between planning and delivery.",
  targetUsers: "Small product teams using AI design and development tools.",
  valueProposition: "One governed flow from decision to release evidence.",
  mvpScope: "PRD Wizard\nDesign Workbench\nClaude handoff",
  outOfScope: "Automatic Claude invocation\nRBAC",
  successMetrics: "PRD approval completed\nDesign handoff linked",
  constraints: "Single-user SQLite MVP\nGit remains document SSOT",
});
if (!brief.markdown.includes("## MVP 범위")) throw new Error("PRD Markdown was not generated");
const approvedBrief = approveProcessProjectBrief(createdProject.project.id);
if (approvedBrief.status !== "approved") throw new Error("PRD approval failed");

let designApprovalRejected = false;
try {
  approveProcessDesignPack(createdProject.project.id);
} catch {
  designApprovalRejected = true;
}
if (!designApprovalRejected) throw new Error("Empty Design Pack was approved");

const designPack = updateProcessDesignPack(createdProject.project.id, {
  conceptName: "Operational clarity",
  mood: "calm, precise, premium",
  palette: "zinc, white, violet accent",
  typography: "Noto Sans KR",
  screens: [{ name: "Project", purpose: "Manage delivery", sections: "PRD, design, stage", primaryAction: "Approve PRD" }],
  storyboard: [{ actor: "PM", action: "approves the PRD", screen: "Project", outcome: "Design work starts" }],
  handoffUrl: "",
});
if (!designPack.handoffPrompt.includes("Claude Design") || designPack.screens.length !== 1) {
  throw new Error("Claude Design handoff was not generated");
}
const designJob = createProcessDesignJob(createdProject.project.id);
if (designJob.status !== "queued" || !designJob.promptSnapshot.includes("Claude Design")) {
  throw new Error("Claude Design Job was not queued with a prompt snapshot");
}
const startedDesignJob = startProcessDesignJob(createdProject.project.id, designJob.id);
if (startedDesignJob.status !== "in_progress") throw new Error("Claude Design Job did not start");
let invalidResultRejected = false;
try {
  submitProcessDesignJob(createdProject.project.id, designJob.id, { resultUrl: "https://example.com/design", note: "invalid provider" });
} catch {
  invalidResultRejected = true;
}
if (!invalidResultRejected) throw new Error("Non-Claude Design result URL was accepted");
const submittedDesignJob = submitProcessDesignJob(createdProject.project.id, designJob.id, {
  resultUrl: "https://claude.ai/design/example",
  note: "validation result",
});
if (submittedDesignJob.status !== "submitted") throw new Error("Claude Design result was not submitted");
const changesRequestedJob = requestProcessDesignChanges(createdProject.project.id, designJob.id, {
  note: "increase contrast before approval",
});
if (changesRequestedJob.status !== "changes_requested") throw new Error("Claude Design change request failed");
const revisedDesignJob = createProcessDesignJob(createdProject.project.id);
startProcessDesignJob(createdProject.project.id, revisedDesignJob.id);
submitProcessDesignJob(createdProject.project.id, revisedDesignJob.id, {
  resultUrl: "https://claude.ai/design/revised-example",
  note: "contrast revision complete",
});
const approvedDesign = approveProcessDesignPack(createdProject.project.id);
if (approvedDesign.status !== "approved") throw new Error("Design Pack approval failed");
const exportBundle = exportProcessProject(createdProject.project.id);
if (exportBundle.files.length !== 3 || !exportBundle.files.some((file) => file.path.endsWith("PRD.md"))) {
  throw new Error("Approved project export bundle was not generated");
}
const invalidatedJob = createProcessDesignJob(createdProject.project.id);
updateProcessProjectBrief(createdProject.project.id, {
  problem: brief.problem,
  targetUsers: brief.targetUsers,
  valueProposition: brief.valueProposition,
  mvpScope: brief.mvpScope,
  outOfScope: brief.outOfScope,
  successMetrics: brief.successMetrics,
  constraints: `${brief.constraints}\nApproved PRD changes invalidate design approval`,
});
const invalidatedWorkspace = loadProcessWorkspace();
if (invalidatedWorkspace.designPacks[0]?.status !== "draft") {
  throw new Error("PRD change did not invalidate Design Pack approval");
}
if (invalidatedWorkspace.designJobs.find((job) => job.id === invalidatedJob.id)?.status !== "changes_requested") {
  throw new Error("PRD change did not invalidate the open Design Job");
}
approveProcessProjectBrief(createdProject.project.id);
let staleDesignApprovalRejected = false;
try {
  approveProcessDesignPack(createdProject.project.id);
} catch {
  staleDesignApprovalRejected = true;
}
if (!staleDesignApprovalRejected) throw new Error("A stale Claude Design result was approved");
const refreshedJob = createProcessDesignJob(createdProject.project.id);
startProcessDesignJob(createdProject.project.id, refreshedJob.id);
submitProcessDesignJob(createdProject.project.id, refreshedJob.id, {
  resultUrl: "https://claude.ai/design/refreshed-example",
  note: "updated after PRD change",
});
approveProcessDesignPack(createdProject.project.id);

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
if (
  validatedWorkspace.projects.length !== 2 ||
  validatedWorkspace.templates.length !== 4 ||
  validatedWorkspace.briefs.find((item) => item.projectId === createdProject.project.id)?.status !== "approved" ||
  validatedWorkspace.designPacks.find((item) => item.projectId === createdProject.project.id)?.status !== "approved" ||
  validatedWorkspace.designJobs[0]?.status !== "approved" ||
  validatedWorkspace.auditEvents.length < 11
) {
  throw new Error("Writable process audit validation failed");
}

console.log("sqlite template, PRD, Design Job, export, deliverable, evidence, and gate lifecycle ok");
