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

export interface ProcessStatus {
  version: number;
  updatedAt: string;
  systemVersion: string;
  sprint: ProcessSprint;
  phases: ProcessPhase[];
  intakes: ProcessIntake[];
  deliverables: ProcessDeliverable[];
  features: ProcessCheckItem[];
  apps: ProcessApp[];
}
