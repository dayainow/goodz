import type {
  CreateProcessIncidentRequest,
  CreateProcessEvidenceRequest,
  CreateProcessProjectRequest,
  CreateProcessProjectResponse,
  CreateProcessTemplateRequest,
  DecideProcessGateRequest,
  ProcessIncident,
  ProcessProjectBrief,
  ProcessDesignPack,
  ProcessDesignJob,
  ProcessProjectExportBundle,
  ProcessProjectBook,
  DecideProcessGateResponse,
  ProcessDocumentResponse,
  ProcessMetricSnapshotsFile,
  ProcessOperationsOverview,
  ProcessReferenceCapability,
  ProcessRun,
  ProcessStatus,
  ProcessTemplate,
  ProcessWorkspaceOverview,
  UpdateProcessStageRequest,
  UpdateProcessDeliverableRequest,
  UpdateProcessDesignPackRequest,
  UpdateProcessProjectBriefRequest,
  UpdateProcessTaskRequest,
  SubmitProcessDesignJobRequest,
  RequestProcessDesignChangesRequest,
} from "@goodz/process";

const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? "" : "http://localhost:4000");

export async function fetchProcessStatus(): Promise<ProcessStatus> {
  const res = await fetch(`${API_URL}/api/process/status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ProcessStatus>;
}

export async function fetchProcessReference(): Promise<ProcessReferenceCapability> {
  const res = await fetch(`${API_URL}/api/process/reference`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ProcessReferenceCapability>;
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

async function processCommand<T>(path: string, method: "PATCH" | "POST", input?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    ...(input === undefined ? {} : { body: JSON.stringify(input) }),
  });
  if (!res.ok) throw new Error((await res.json() as { message?: string }).message ?? `HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export function updateProjectBrief(projectId: string, input: UpdateProcessProjectBriefRequest) {
  return processCommand<ProcessProjectBrief>(`/api/process/projects/${encodeURIComponent(projectId)}/brief`, "PATCH", input);
}

export function approveProjectBrief(projectId: string) {
  return processCommand<ProcessProjectBrief>(`/api/process/projects/${encodeURIComponent(projectId)}/brief/approve`, "POST");
}

export function updateDesignPack(projectId: string, input: UpdateProcessDesignPackRequest) {
  return processCommand<ProcessDesignPack>(`/api/process/projects/${encodeURIComponent(projectId)}/design-pack`, "PATCH", input);
}

export function approveDesignPack(projectId: string) {
  return processCommand<ProcessDesignPack>(`/api/process/projects/${encodeURIComponent(projectId)}/design-pack/approve`, "POST");
}

export function createDesignJob(projectId: string) {
  return processCommand<ProcessDesignJob>(`/api/process/projects/${encodeURIComponent(projectId)}/design-jobs`, "POST");
}

export function startDesignJob(projectId: string, jobId: string) {
  return processCommand<ProcessDesignJob>(`/api/process/projects/${encodeURIComponent(projectId)}/design-jobs/${encodeURIComponent(jobId)}/start`, "POST");
}

export function submitDesignJob(projectId: string, jobId: string, input: SubmitProcessDesignJobRequest) {
  return processCommand<ProcessDesignJob>(`/api/process/projects/${encodeURIComponent(projectId)}/design-jobs/${encodeURIComponent(jobId)}/submit`, "POST", input);
}

export function requestDesignChanges(projectId: string, jobId: string, input: RequestProcessDesignChangesRequest) {
  return processCommand<ProcessDesignJob>(`/api/process/projects/${encodeURIComponent(projectId)}/design-jobs/${encodeURIComponent(jobId)}/changes`, "POST", input);
}

export async function fetchProjectExport(projectId: string): Promise<ProcessProjectExportBundle> {
  const res = await fetch(`${API_URL}/api/process/projects/${encodeURIComponent(projectId)}/export`);
  if (!res.ok) throw new Error((await res.json() as { message?: string }).message ?? `HTTP ${res.status}`);
  return res.json() as Promise<ProcessProjectExportBundle>;
}

export async function fetchProjectBook(projectId: string): Promise<ProcessProjectBook> {
  const res = await fetch(`${API_URL}/api/process/projects/${encodeURIComponent(projectId)}/book`);
  if (!res.ok) throw new Error((await res.json() as { message?: string }).message ?? `HTTP ${res.status}`);
  return res.json() as Promise<ProcessProjectBook>;
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
): Promise<DecideProcessGateResponse> {
  const res = await fetch(
    `${API_URL}/api/process/runs/${encodeURIComponent(runId)}/stages/${encodeURIComponent(stageId)}/gate-decisions`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) throw new Error((await res.json() as { message?: string }).message ?? `HTTP ${res.status}`);
  return res.json() as Promise<DecideProcessGateResponse>;
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
