import type {
  CreateProcessProjectRequest,
  CreateProcessProjectResponse,
  MigrateProcessTemplateResponse,
  ProcessProjectExportBundle,
  ProcessWorkspaceOverview,
} from "@goodz/process";

export interface GoodzClientOptions {
  apiUrl: string;
  user?: string;
  password?: string;
}

export class GoodzClient {
  private readonly baseUrl: string;
  private readonly authorization?: string;

  constructor(options: GoodzClientOptions) {
    this.baseUrl = options.apiUrl.replace(/\/$/, "");
    if ((options.user && !options.password) || (!options.user && options.password)) {
      throw new Error("Both Basic Auth user and password are required");
    }
    this.authorization = options.user && options.password
      ? `Basic ${Buffer.from(`${options.user}:${options.password}`).toString("base64")}`
      : undefined;
  }

  private async request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api/process${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { "content-type": "application/json" }),
        ...(this.authorization ? { authorization: this.authorization } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const text = await response.text();
    let data: (T & { message?: string }) | undefined;
    try {
      data = JSON.parse(text) as T & { message?: string };
    } catch {
      data = undefined;
    }
    if (!response.ok) throw new Error(data?.message || text.trim() || `Goodz API returned HTTP ${response.status}`);
    if (!data) throw new Error("Goodz API returned a non-JSON response");
    return data;
  }

  workspace() {
    return this.request<ProcessWorkspaceOverview>("/workspace");
  }

  createProject(input: CreateProcessProjectRequest) {
    return this.request<CreateProcessProjectResponse>("/projects", "POST", input);
  }

  migrateTemplate(templateId: string, input: { name?: string; summary?: string }) {
    return this.request<MigrateProcessTemplateResponse>(
      `/templates/${encodeURIComponent(templateId)}/versions`,
      "POST",
      input,
    );
  }

  exportProject(projectId: string) {
    return this.request<ProcessProjectExportBundle>(`/projects/${encodeURIComponent(projectId)}/export`);
  }
}
