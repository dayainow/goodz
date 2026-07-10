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

export interface ProcessStatus {
  version: number;
  updatedAt: string;
  systemVersion: string;
  sprint: ProcessSprint;
  phases: ProcessPhase[];
  features: ProcessCheckItem[];
  apps: ProcessApp[];
}
