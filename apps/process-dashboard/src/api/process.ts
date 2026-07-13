import type {
  ProcessDocumentResponse,
  ProcessMetricSnapshotsFile,
  ProcessStatus,
} from "@goodz/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export async function fetchProcessStatus(): Promise<ProcessStatus> {
  const res = await fetch(`${API_URL}/api/process/status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ProcessStatus>;
}

export async function fetchProcessMetricSnapshots(): Promise<ProcessMetricSnapshotsFile> {
  const res = await fetch(`${API_URL}/api/process/metrics-snapshots`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ProcessMetricSnapshotsFile>;
}

export async function fetchProcessDocument(path: string): Promise<ProcessDocumentResponse> {
  const params = new URLSearchParams({ path });
  const res = await fetch(`${API_URL}/api/process/document?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ProcessDocumentResponse>;
}
