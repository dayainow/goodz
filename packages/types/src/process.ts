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

export interface ProcessApproval {
  id: string;
  target: string;
  approver: string;
  status: "approved" | "requested" | "changes_requested";
  approvedAt: string;
  summary: string;
  doc: string;
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
  features: ProcessCheckItem[];
  apps: ProcessApp[];
}
