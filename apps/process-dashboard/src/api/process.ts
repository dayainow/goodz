import type {
  CreateProcessIncidentRequest,
  ProcessIncident,
  ProcessDocumentResponse,
  ProcessMetricSnapshotsFile,
  ProcessOperationsOverview,
  ProcessStatus,
} from "@goodz/types";

const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? "" : "http://localhost:4000");

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

export async function fetchProcessOperations(): Promise<ProcessOperationsOverview> {
  const res = await fetch(`${API_URL}/api/process/operations`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ProcessOperationsOverview>;
}

export async function createProcessIncident(
  input: CreateProcessIncidentRequest,
): Promise<ProcessIncident> {
  const res = await fetch(`${API_URL}/api/process/incidents`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ProcessIncident>;
}

export async function resolveProcessIncident(id: string): Promise<ProcessIncident> {
  const res = await fetch(
    `${API_URL}/api/process/incidents/${encodeURIComponent(id)}/resolve`,
    { method: "PATCH" },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ProcessIncident>;
}
