export type ProcessItemStatus = "done" | "in_progress" | "pending" | "blocked";

export interface ProcessCheckItem {
  id: string;
  label: string;
  status: ProcessItemStatus;
  doc?: string;
  url?: string;
}

export interface ProcessPhase {
  id: string;
  name: string;
  status: ProcessItemStatus;
  progress: number;
  items: ProcessCheckItem[];
}

export interface ProcessSprint {
  id: string;
  name: string;
  status: ProcessItemStatus;
  goal: string;
}

export interface ProcessApp {
  id: string;
  name: string;
  port: number;
  role: string;
  url: string;
}

export type ProcessDeliverableType =
  | "planning"
  | "design"
  | "engineering"
  | "qa"
  | "release"
  | "ops"
  | "retro";

export interface ProcessDeliverable {
  id: string;
  title: string;
  type: ProcessDeliverableType;
  phase: string;
  status: ProcessItemStatus;
  doc: string;
  owner: string;
  summary: string;
}

export interface ProcessIntake {
  id: string;
  title: string;
  source: string;
  status: ProcessItemStatus;
  phase: string;
  doc: string;
  nextAction: string;
}

export type ProcessApprovalStatus =
  | "approved"
  | "requested"
  | "changes_requested";

export type ProcessApprovalType =
  | "phase_gate"
  | "sprint"
  | "deliverable"
  | "change"
  | "release";

export interface ProcessApproval {
  id: string;
  target: string;
  type: ProcessApprovalType;
  driver: string;
  approver: string;
  contributors: string[];
  informed: string[];
  status: ProcessApprovalStatus;
  requestedAt: string;
  approvedAt: string;
  decision: string;
  criteria: string[];
  summary: string;
  doc: string;
  traceLinkIds: string[];
}

export type ProcessPlanningChangeStatus =
  | "proposed"
  | "approved"
  | "applied"
  | "rejected";

export interface ProcessPlanningChange {
  id: string;
  title: string;
  status: ProcessPlanningChangeStatus;
  requestedAt: string;
  source: string;
  targetDocs: string[];
  doc: string;
  summary: string;
  decision: string;
}

export interface ProcessDesignReference {
  id: string;
  name: string;
  source: string;
  url: string;
  category: "foundation" | "component" | "pattern" | "commerce" | "accessibility";
  takeaways: string[];
  applyTo: string[];
  status: ProcessItemStatus;
  doc: string;
}

export interface ProcessWireframe {
  id: string;
  title: string;
  screen: string;
  fidelity: "low" | "mid" | "high";
  status: ProcessItemStatus;
  doc: string;
  references: string[];
  summary: string;
}

export interface ProcessStoryboard {
  id: string;
  title: string;
  actor: string;
  status: ProcessItemStatus;
  doc: string;
  steps: string[];
  linkedWireframes: string[];
  summary: string;
}

export type ProcessTraceStatus = "pending" | "partial" | "linked" | "released";

export type ProcessTraceReferenceStatus =
  | "pending"
  | "linked"
  | "not_required";

export interface ProcessTraceReference {
  label: string;
  status: ProcessTraceReferenceStatus;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string;
  mergedAt?: string;
  publishedAt?: string;
}

export interface ProcessTraceCommit {
  sha: string;
  message: string;
  url: string;
  committedAt?: string;
}

export interface ProcessTraceCiRun {
  id: string;
  status: "success" | "failed" | "running" | "pending";
  url: string;
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ProcessTraceSmoke {
  status: "passed" | "failed" | "pending" | "not_required";
  command: string;
  checkedAt?: string;
  url?: string;
  summary: string;
}

export interface ProcessTraceLink {
  id: string;
  title: string;
  status: ProcessTraceStatus;
  sourceIds: string[];
  changeIds: string[];
  deliverableIds: string[];
  approvalIds: string[];
  issue: ProcessTraceReference;
  pr: ProcessTraceReference;
  commits: ProcessTraceCommit[];
  ciRuns: ProcessTraceCiRun[];
  release: ProcessTraceReference;
  smoke?: ProcessTraceSmoke;
  summary: string;
  nextAction: string;
}

export interface ProcessMetricSnapshot {
  id: string;
  capturedAt: string;
  source: {
    systemVersion: string;
    statusUpdatedAt: string;
    headSha?: string;
  };
  totals: {
    traceCount: number;
    linkedTraceCount: number;
    releasedTraceCount: number;
    evidenceIssues: number;
  };
  delivery: {
    deploymentFrequency: number;
    leadTimeHours: number | null;
    ciSuccessRate: number | null;
    changeFailureRate: number;
    smokePassRate: number | null;
    traceCoverage: number;
    evidenceCompleteness: number;
    mttrHours: number | null;
  };
  notes?: string;
}

export interface ProcessMetricSnapshotsFile {
  version: number;
  updatedAt: string;
  snapshots: ProcessMetricSnapshot[];
}

export interface ProcessDocumentResponse {
  path: string;
  title: string;
  content: string;
  updatedAt: string;
}

export type ProcessIncidentSeverity = "low" | "medium" | "high" | "critical";
export type ProcessIncidentStatus = "open" | "resolved";

export interface ProcessIncident {
  id: string;
  title: string;
  severity: ProcessIncidentSeverity;
  status: ProcessIncidentStatus;
  summary: string;
  occurredAt: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProcessIncidentRequest {
  title: string;
  severity: ProcessIncidentSeverity;
  summary: string;
  occurredAt?: string;
}

export type ProcessProjectStatus = "active" | "archived";
export type ProcessRunStatus = "active" | "blocked" | "completed" | "cancelled";
export type ProcessGateDecision = "pending" | "go" | "hold" | "kill";

export interface ProcessTaskTemplate {
  id: string;
  title: string;
  summary: string;
}

export interface ProcessDeliverableTemplate {
  id: string;
  title: string;
  summary: string;
  required: boolean;
}

export interface ProcessStageTemplate {
  id: string;
  code: string;
  name: string;
  summary: string;
  position: number;
  tasks: ProcessTaskTemplate[];
  deliverables: ProcessDeliverableTemplate[];
}

export interface ProcessTemplate {
  id: string;
  name: string;
  version: number;
  summary: string;
  createdAt: string;
  stages: ProcessStageTemplate[];
}

export interface ProcessProject {
  id: string;
  name: string;
  summary: string;
  owner: string;
  status: ProcessProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export type ProcessWorkbenchStatus = "draft" | "approved";

export interface ProcessProjectBrief {
  projectId: string;
  status: ProcessWorkbenchStatus;
  problem: string;
  targetUsers: string;
  valueProposition: string;
  mvpScope: string;
  outOfScope: string;
  successMetrics: string;
  constraints: string;
  markdown: string;
  approvedAt?: string;
  updatedAt: string;
}

export interface ProcessDesignScreen {
  id: string;
  name: string;
  purpose: string;
  sections: string;
  primaryAction: string;
}

export interface ProcessStoryboardStep {
  id: string;
  actor: string;
  action: string;
  screen: string;
  outcome: string;
}

export interface ProcessDesignPack {
  projectId: string;
  status: ProcessWorkbenchStatus;
  conceptName: string;
  mood: string;
  palette: string;
  typography: string;
  screens: ProcessDesignScreen[];
  storyboard: ProcessStoryboardStep[];
  handoffPrompt: string;
  handoffUrl: string;
  approvedAt?: string;
  updatedAt: string;
}

export type ProcessDesignConnector = "manual_claude_design";
export type ProcessDesignJobStatus =
  | "queued"
  | "in_progress"
  | "submitted"
  | "changes_requested"
  | "approved";

export interface ProcessDesignJob {
  id: string;
  projectId: string;
  connector: ProcessDesignConnector;
  status: ProcessDesignJobStatus;
  promptSnapshot: string;
  resultUrl: string;
  note: string;
  createdAt: string;
  startedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  updatedAt: string;
}

export interface ProcessExportFile {
  path: string;
  mediaType: "text/markdown";
  content: string;
}

export interface ProcessProjectExportBundle {
  schemaVersion: 1;
  projectId: string;
  projectName: string;
  generatedAt: string;
  files: ProcessExportFile[];
}

/** Workspace에 쓴(또는 쓸 예정인) Markdown 산출물 경로 */
export interface ProcessArtifactWriteResult {
  projectId: string;
  relativeRoot: string;
  written: string[];
  skipped: string[];
  diskWriteEnabled: boolean;
}

export interface DecideProcessGateResponse {
  run: ProcessRun;
  artifacts: ProcessArtifactWriteResult;
}

export interface ProcessProjectBook {
  schemaVersion: 1;
  projectId: string;
  projectName: string;
  runId: string;
  generatedAt: string;
  path: string;
  markdown: string;
  written: boolean;
}

export interface ProcessTaskRun {
  id: string;
  templateTaskId: string;
  title: string;
  summary: string;
  status: ProcessItemStatus;
  assignee: string;
  position: number;
  updatedAt: string;
}

export interface ProcessGateRun {
  id: string;
  decision: ProcessGateDecision;
  note: string;
  decidedAt?: string;
  updatedAt: string;
}

export type ProcessDeliverableRunStatus =
  | "pending"
  | "submitted"
  | "approved"
  | "changes_requested";

export interface ProcessDeliverableRun {
  id: string;
  templateDeliverableId: string;
  title: string;
  summary: string;
  required: boolean;
  status: ProcessDeliverableRunStatus;
  owner: string;
  uri: string;
  note: string;
  position: number;
  updatedAt: string;
}

export type ProcessEvidenceType =
  | "document"
  | "issue"
  | "pr"
  | "commit"
  | "ci"
  | "release"
  | "link";

export interface ProcessEvidence {
  id: string;
  type: ProcessEvidenceType;
  label: string;
  url: string;
  summary: string;
  createdAt: string;
}

export interface ProcessStageRun {
  id: string;
  templateStageId: string;
  name: string;
  summary: string;
  status: ProcessItemStatus;
  position: number;
  tasks: ProcessTaskRun[];
  deliverables: ProcessDeliverableRun[];
  evidence: ProcessEvidence[];
  gate: ProcessGateRun;
  updatedAt: string;
}

export interface ProcessRun {
  id: string;
  projectId: string;
  templateId: string;
  templateVersion: number;
  status: ProcessRunStatus;
  currentStageId: string | null;
  createdAt: string;
  updatedAt: string;
  stages: ProcessStageRun[];
}

export interface ProcessAuditEvent {
  id: string;
  entityType: "project" | "run" | "stage" | "task" | "gate" | "template" | "deliverable" | "evidence" | "design_job";
  entityId: string;
  action: string;
  detail: string;
  createdAt: string;
}

export interface ProcessWorkspaceOverview {
  templates: ProcessTemplate[];
  projects: ProcessProject[];
  runs: ProcessRun[];
  briefs: ProcessProjectBrief[];
  designPacks: ProcessDesignPack[];
  designJobs: ProcessDesignJob[];
  auditEvents: ProcessAuditEvent[];
}

export interface CreateProcessProjectRequest {
  name: string;
  summary: string;
  owner: string;
  templateId: string;
}

export interface CreateProcessTemplateRequest {
  name: string;
  summary: string;
  stages: Array<{
    code: string;
    name: string;
    summary: string;
    tasks: Array<{ title: string; summary: string }>;
    deliverables: Array<{
      title: string;
      summary: string;
      required: boolean;
    }>;
  }>;
}

export interface MigrateProcessTemplateRequest {
  name?: string;
  summary?: string;
}

export interface MigrateProcessTemplateResponse {
  source: ProcessTemplate;
  target: ProcessTemplate;
}

export interface CreateProcessProjectResponse {
  project: ProcessProject;
  run: ProcessRun;
  artifacts: ProcessArtifactWriteResult;
}

export interface UpdateProcessProjectBriefRequest {
  problem: string;
  targetUsers: string;
  valueProposition: string;
  mvpScope: string;
  outOfScope: string;
  successMetrics: string;
  constraints: string;
}

export interface UpdateProcessDesignPackRequest {
  conceptName: string;
  mood: string;
  palette: string;
  typography: string;
  screens: Array<Omit<ProcessDesignScreen, "id">>;
  storyboard: Array<Omit<ProcessStoryboardStep, "id">>;
  handoffUrl: string;
}

export interface SubmitProcessDesignJobRequest {
  resultUrl: string;
  note: string;
}

export interface RequestProcessDesignChangesRequest {
  note: string;
}

export interface UpdateProcessTaskRequest {
  status: ProcessItemStatus;
  assignee?: string;
}

export interface UpdateProcessStageRequest {
  status: "in_progress" | "blocked";
}

export interface UpdateProcessDeliverableRequest {
  status: ProcessDeliverableRunStatus;
  owner?: string;
  uri?: string;
  note?: string;
}

export interface CreateProcessEvidenceRequest {
  type: ProcessEvidenceType;
  label: string;
  url: string;
  summary: string;
}

export interface DecideProcessGateRequest {
  decision: Exclude<ProcessGateDecision, "pending">;
  note: string;
}

export interface ProcessOperationsOverview {
  storage: {
    engine: "sqlite";
    durability: "memory" | "local" | "persistent";
    schemaVersion: number;
  };
  documents: {
    indexed: number;
    syncedAt: string | null;
  };
  incidents: {
    open: number;
    resolved: number;
    mttrHours: number | null;
    items: ProcessIncident[];
  };
}

export interface ProcessStatus {
  version: number;
  updatedAt: string;
  systemVersion: string;
  sprint: ProcessSprint;
  phases: ProcessPhase[];
  intakes: ProcessIntake[];
  deliverables: ProcessDeliverable[];
  approvals: ProcessApproval[];
  planningChanges: ProcessPlanningChange[];
  designReferences: ProcessDesignReference[];
  wireframes: ProcessWireframe[];
  storyboards: ProcessStoryboard[];
  traceLinks: ProcessTraceLink[];
  features: ProcessCheckItem[];
  apps: ProcessApp[];
}

export interface ProcessReferenceCapability {
  available: boolean;
  id?: string;
  name?: string;
}
