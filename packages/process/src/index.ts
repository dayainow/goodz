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
