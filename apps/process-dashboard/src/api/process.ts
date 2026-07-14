import type {
  CreateProcessIncidentRequest,
  CreateProcessEvidenceRequest,
  CreateProcessProjectRequest,
  CreateProcessProjectResponse,
  CreateProcessTemplateRequest,
  DecideProcessGateRequest,
  ProcessIncident,
  ProcessDocumentResponse,
  ProcessMetricSnapshotsFile,
  ProcessOperationsOverview,
  ProcessRun,
  ProcessStatus,
  ProcessTemplate,
  ProcessWorkspaceOverview,
  UpdateProcessStageRequest,
  UpdateProcessDeliverableRequest,
  UpdateProcessTaskRequest,
} from "@goodz/process";

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

export async function fetchProcessWorkspace(): Promise<ProcessWorkspaceOverview> {
  const res = await fetch(`${API_URL}/api/process/workspace`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ProcessWorkspaceOverview>;
}

export async function createProcessProject(
  input: CreateProcessProjectRequest,
): Promise<CreateProcessProjectResponse> {
  const res = await fetch(`${API_URL}/api/process/projects`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error((await res.json() as { message?: string }).message ?? `HTTP ${res.status}`);
  return res.json() as Promise<CreateProcessProjectResponse>;
}

export async function createProcessTemplate(
  input: CreateProcessTemplateRequest,
): Promise<ProcessTemplate> {
  const res = await fetch(`${API_URL}/api/process/templates`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error((await res.json() as { message?: string }).message ?? `HTTP ${res.status}`);
  return res.json() as Promise<ProcessTemplate>;
}

export async function updateProcessStage(
  runId: string,
  stageId: string,
  input: UpdateProcessStageRequest,
): Promise<ProcessRun> {
  const res = await fetch(
    `${API_URL}/api/process/runs/${encodeURIComponent(runId)}/stages/${encodeURIComponent(stageId)}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) throw new Error((await res.json() as { message?: string }).message ?? `HTTP ${res.status}`);
  return res.json() as Promise<ProcessRun>;
}

export async function updateProcessTask(
  runId: string,
  stageId: string,
  taskId: string,
  input: UpdateProcessTaskRequest,
): Promise<ProcessRun> {
  const res = await fetch(
    `${API_URL}/api/process/runs/${encodeURIComponent(runId)}/stages/${encodeURIComponent(stageId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) throw new Error((await res.json() as { message?: string }).message ?? `HTTP ${res.status}`);
  return res.json() as Promise<ProcessRun>;
}

export async function updateProcessDeliverable(
  runId: string,
  stageId: string,
  deliverableId: string,
  input: UpdateProcessDeliverableRequest,
): Promise<ProcessRun> {
  const res = await fetch(
    `${API_URL}/api/process/runs/${encodeURIComponent(runId)}/stages/${encodeURIComponent(stageId)}/deliverables/${encodeURIComponent(deliverableId)}`,
    { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(input) },
  );
  if (!res.ok) throw new Error((await res.json() as { message?: string }).message ?? `HTTP ${res.status}`);
  return res.json() as Promise<ProcessRun>;
}

export async function createProcessEvidence(
  runId: string,
  stageId: string,
  input: CreateProcessEvidenceRequest,
): Promise<ProcessRun> {
  const res = await fetch(
    `${API_URL}/api/process/runs/${encodeURIComponent(runId)}/stages/${encodeURIComponent(stageId)}/evidence`,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) },
  );
  if (!res.ok) throw new Error((await res.json() as { message?: string }).message ?? `HTTP ${res.status}`);
  return res.json() as Promise<ProcessRun>;
}

export async function decideProcessGate(
  runId: string,
  stageId: string,
  input: DecideProcessGateRequest,
): Promise<ProcessRun> {
  const res = await fetch(
    `${API_URL}/api/process/runs/${encodeURIComponent(runId)}/stages/${encodeURIComponent(stageId)}/gate-decisions`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) throw new Error((await res.json() as { message?: string }).message ?? `HTTP ${res.status}`);
  return res.json() as Promise<ProcessRun>;
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
