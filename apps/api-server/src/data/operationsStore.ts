import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import type {
  CreateProcessProjectRequest,
  CreateProcessProjectResponse,
  CreateProcessEvidenceRequest,
  CreateProcessTemplateRequest,
  CreateProcessIncidentRequest,
  DecideProcessGateRequest,
  ProcessAuditEvent,
  ProcessDeliverableRun,
  ProcessEvidence,
  ProcessGateDecision,
  ProcessIncident,
  ProcessOperationsOverview,
  ProcessProject,
  ProcessRun,
  ProcessStageRun,
  ProcessTaskRun,
  ProcessTemplate,
  ProcessWorkspaceOverview,
  UpdateProcessStageRequest,
  UpdateProcessDeliverableRequest,
  UpdateProcessTaskRequest,
} from "@goodz/process";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const docsRoot = path.join(repoRoot, "docs");
const templatesRoot = path.join(repoRoot, "templates/process");
const defaultDatabasePath = path.join(repoRoot, "data/goodz.db");
const databasePath = process.env.GOODZ_DB_PATH ?? defaultDatabasePath;
const durability =
  databasePath === ":memory:"
    ? "memory"
    : process.env.GOODZ_DB_DURABILITY === "persistent"
      ? "persistent"
      : "local";

if (databasePath !== ":memory:") {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
}

const database = new DatabaseSync(databasePath);
database.exec("PRAGMA foreign_keys = ON");
database.exec("PRAGMA journal_mode = WAL");
database.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS operations_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS document_index (
    path TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    modified_at TEXT NOT NULL,
    synced_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL CHECK (status IN ('open', 'resolved')),
    summary TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    resolved_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version INTEGER NOT NULL,
    summary TEXT NOT NULL,
    created_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_template_stages (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL REFERENCES process_templates(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    summary TEXT NOT NULL,
    position INTEGER NOT NULL,
    UNIQUE(template_id, position)
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_template_tasks (
    id TEXT PRIMARY KEY,
    stage_id TEXT NOT NULL REFERENCES process_template_stages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    position INTEGER NOT NULL,
    UNIQUE(stage_id, position)
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_template_deliverables (
    id TEXT PRIMARY KEY,
    stage_id TEXT NOT NULL REFERENCES process_template_stages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    required INTEGER NOT NULL CHECK (required IN (0, 1)),
    position INTEGER NOT NULL,
    UNIQUE(stage_id, position)
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    summary TEXT NOT NULL,
    owner TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'archived')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_runs (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES process_projects(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL REFERENCES process_templates(id),
    template_version INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'blocked', 'completed', 'cancelled')),
    current_stage_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_stage_runs (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES process_runs(id) ON DELETE CASCADE,
    template_stage_id TEXT NOT NULL REFERENCES process_template_stages(id),
    name TEXT NOT NULL,
    summary TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('done', 'in_progress', 'pending', 'blocked')),
    position INTEGER NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(run_id, position)
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_task_runs (
    id TEXT PRIMARY KEY,
    stage_run_id TEXT NOT NULL REFERENCES process_stage_runs(id) ON DELETE CASCADE,
    template_task_id TEXT NOT NULL REFERENCES process_template_tasks(id),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('done', 'in_progress', 'pending', 'blocked')),
    assignee TEXT NOT NULL,
    position INTEGER NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(stage_run_id, position)
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_deliverable_runs (
    id TEXT PRIMARY KEY,
    stage_run_id TEXT NOT NULL REFERENCES process_stage_runs(id) ON DELETE CASCADE,
    template_deliverable_id TEXT NOT NULL REFERENCES process_template_deliverables(id),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    required INTEGER NOT NULL CHECK (required IN (0, 1)),
    status TEXT NOT NULL CHECK (status IN ('pending', 'submitted', 'approved', 'changes_requested')),
    owner TEXT NOT NULL,
    uri TEXT NOT NULL,
    note TEXT NOT NULL,
    position INTEGER NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(stage_run_id, position)
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_evidence (
    id TEXT PRIMARY KEY,
    stage_run_id TEXT NOT NULL REFERENCES process_stage_runs(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('document', 'issue', 'pr', 'commit', 'ci', 'release', 'link')),
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_gate_decisions (
    id TEXT PRIMARY KEY,
    stage_run_id TEXT NOT NULL UNIQUE REFERENCES process_stage_runs(id) ON DELETE CASCADE,
    decision TEXT NOT NULL CHECK (decision IN ('pending', 'go', 'hold', 'kill')),
    note TEXT NOT NULL,
    decided_at TEXT,
    updated_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS process_audit_events (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'run', 'stage', 'task', 'gate', 'template', 'deliverable', 'evidence')),
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    detail TEXT NOT NULL,
    created_at TEXT NOT NULL
  ) STRICT;

  INSERT OR IGNORE INTO schema_migrations(version, applied_at)
  VALUES (1, datetime('now'));

  INSERT OR IGNORE INTO schema_migrations(version, applied_at)
  VALUES (2, datetime('now'));

  INSERT OR IGNORE INTO schema_migrations(version, applied_at)
  VALUES (3, datetime('now'));
`);

const auditSchema = database
  .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'process_audit_events'")
  .get() as unknown as { sql: string };
if (!auditSchema.sql.includes("'template'")) {
  database.exec(`
    BEGIN IMMEDIATE;
    ALTER TABLE process_audit_events RENAME TO process_audit_events_v2;
    CREATE TABLE process_audit_events (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'run', 'stage', 'task', 'gate', 'template', 'deliverable', 'evidence')),
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      detail TEXT NOT NULL,
      created_at TEXT NOT NULL
    ) STRICT;
    INSERT INTO process_audit_events SELECT * FROM process_audit_events_v2;
    DROP TABLE process_audit_events_v2;
    COMMIT;
  `);
}

interface TemplateDefinition extends CreateProcessTemplateRequest {
  id: string;
  version: number;
}

function insertProcessTemplate(definition: TemplateDefinition, ignoreExisting: boolean) {
  const now = new Date().toISOString();
  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare(`
        INSERT ${ignoreExisting ? "OR IGNORE" : ""} INTO process_templates(id, name, version, summary, created_at)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(definition.id, definition.name.trim(), definition.version, definition.summary.trim(), now);

    definition.stages.forEach((stage, stageIndex) => {
      const stageId = `${definition.id}-${stage.code.trim().toUpperCase()}`;
      database
        .prepare(`
          INSERT OR IGNORE INTO process_template_stages(
            id, template_id, code, name, summary, position
          ) VALUES (?, ?, ?, ?, ?, ?)
        `)
        .run(
          stageId,
          definition.id,
          stage.code,
          stage.name,
          stage.summary,
          stageIndex,
        );

      stage.tasks.forEach((task, taskIndex) => {
        database
          .prepare(`
            INSERT OR IGNORE INTO process_template_tasks(
              id, stage_id, title, summary, position
            ) VALUES (?, ?, ?, ?, ?)
          `)
          .run(
            `${stageId}-T${taskIndex + 1}`,
            stageId,
            task.title.trim(),
            task.summary.trim(),
            taskIndex,
          );
      });
      stage.deliverables.forEach((deliverable, deliverableIndex) => {
        database
          .prepare(`
            INSERT OR IGNORE INTO process_template_deliverables(
              id, stage_id, title, summary, required, position
            ) VALUES (?, ?, ?, ?, ?, ?)
          `)
          .run(
            `${stageId}-D${deliverableIndex + 1}`,
            stageId,
            deliverable.title.trim(),
            deliverable.summary.trim(),
            deliverable.required ? 1 : 0,
            deliverableIndex,
          );
      });
    });
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function seedProcessTemplates() {
  const files = fs.readdirSync(templatesRoot).filter((file) => file.endsWith(".json")).sort();
  for (const file of files) {
    const definition = JSON.parse(
      fs.readFileSync(path.join(templatesRoot, file), "utf8"),
    ) as TemplateDefinition;
    insertProcessTemplate(definition, true);
  }
}

function backfillProcessDeliverables() {
  const missing = database
    .prepare(`
      SELECT sr.id AS stage_run_id, td.*
      FROM process_stage_runs sr
      JOIN process_template_deliverables td ON td.stage_id = sr.template_stage_id
      LEFT JOIN process_deliverable_runs dr
        ON dr.stage_run_id = sr.id AND dr.template_deliverable_id = td.id
      WHERE dr.id IS NULL
      ORDER BY sr.id, td.position
    `)
    .all() as unknown as Array<TemplateDeliverableRow & { stage_run_id: string }>;
  const now = new Date().toISOString();
  const insert = database.prepare(`
    INSERT INTO process_deliverable_runs(
      id, stage_run_id, template_deliverable_id, title, summary,
      required, status, owner, uri, note, position, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'pending', '', '', '', ?, ?)
  `);
  database.exec("BEGIN IMMEDIATE");
  try {
    for (const deliverable of missing) {
      insert.run(
        `DEL-${randomUUID().slice(0, 8).toUpperCase()}`,
        deliverable.stage_run_id,
        deliverable.id,
        deliverable.title,
        deliverable.summary,
        deliverable.required,
        deliverable.position,
        now,
      );
    }
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function markdownFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(absolutePath);
    return entry.isFile() && entry.name.endsWith(".md") ? [absolutePath] : [];
  });
}

function documentTitle(content: string, fallback: string) {
  const heading = content
    .split("\n")
    .find((line) => line.trim().startsWith("# "));
  return heading ? heading.replace(/^#\s+/, "").trim() : fallback;
}

export function syncDocumentIndex() {
  const syncedAt = new Date().toISOString();
  const upsert = database.prepare(`
    INSERT INTO document_index(path, title, modified_at, synced_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(path) DO UPDATE SET
      title = excluded.title,
      modified_at = excluded.modified_at,
      synced_at = excluded.synced_at
  `);

  database.exec("BEGIN IMMEDIATE");
  try {
    for (const absolutePath of markdownFiles(docsRoot)) {
      const relativePath = path.relative(repoRoot, absolutePath);
      const content = fs.readFileSync(absolutePath, "utf8");
      const modifiedAt = fs.statSync(absolutePath).mtime.toISOString();
      upsert.run(
        relativePath,
        documentTitle(content, path.basename(absolutePath)),
        modifiedAt,
        syncedAt,
      );
    }
    database
      .prepare("INSERT OR REPLACE INTO operations_meta(key, value) VALUES (?, ?)")
      .run("documents_synced_at", syncedAt);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

interface IncidentRow {
  id: string;
  title: string;
  severity: ProcessIncident["severity"];
  status: ProcessIncident["status"];
  summary: string;
  occurred_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

function toIncident(row: IncidentRow): ProcessIncident {
  return {
    id: row.id,
    title: row.title,
    severity: row.severity,
    status: row.status,
    summary: row.summary,
    occurredAt: row.occurred_at,
    ...(row.resolved_at ? { resolvedAt: row.resolved_at } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listIncidents(): ProcessIncident[] {
  const rows = database
    .prepare("SELECT * FROM incidents ORDER BY occurred_at DESC, created_at DESC")
    .all() as unknown as IncidentRow[];
  return rows.map(toIncident);
}

export function createIncident(
  input: CreateProcessIncidentRequest,
): ProcessIncident {
  const now = new Date().toISOString();
  const incident: ProcessIncident = {
    id: `INC-${randomUUID().slice(0, 8).toUpperCase()}`,
    title: input.title.trim(),
    severity: input.severity,
    status: "open",
    summary: input.summary.trim(),
    occurredAt: input.occurredAt ?? now,
    createdAt: now,
    updatedAt: now,
  };

  database
    .prepare(`
      INSERT INTO incidents(
        id, title, severity, status, summary, occurred_at, resolved_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)
    `)
    .run(
      incident.id,
      incident.title,
      incident.severity,
      incident.status,
      incident.summary,
      incident.occurredAt,
      incident.createdAt,
      incident.updatedAt,
    );

  return incident;
}

export function resolveIncident(id: string): ProcessIncident | null {
  const resolvedAt = new Date().toISOString();
  const result = database
    .prepare(`
      UPDATE incidents
      SET status = 'resolved', resolved_at = ?, updated_at = ?
      WHERE id = ? AND status = 'open'
    `)
    .run(resolvedAt, resolvedAt, id);

  if (result.changes === 0) return null;
  const row = database
    .prepare("SELECT * FROM incidents WHERE id = ?")
    .get(id) as unknown as IncidentRow;
  return toIncident(row);
}

interface TemplateRow {
  id: string;
  name: string;
  version: number;
  summary: string;
  created_at: string;
}

interface TemplateStageRow {
  id: string;
  template_id: string;
  name: string;
  summary: string;
  position: number;
}

interface TemplateTaskRow {
  id: string;
  stage_id: string;
  title: string;
  summary: string;
  position: number;
}

interface TemplateDeliverableRow {
  id: string;
  stage_id: string;
  title: string;
  summary: string;
  required: number;
  position: number;
}

interface ProjectRow {
  id: string;
  name: string;
  summary: string;
  owner: string;
  status: ProcessProject["status"];
  created_at: string;
  updated_at: string;
}

interface RunRow {
  id: string;
  project_id: string;
  template_id: string;
  template_version: number;
  status: ProcessRun["status"];
  current_stage_id: string | null;
  created_at: string;
  updated_at: string;
}

interface StageRunRow {
  id: string;
  run_id: string;
  template_stage_id: string;
  name: string;
  summary: string;
  status: ProcessStageRun["status"];
  position: number;
  updated_at: string;
}

interface TaskRunRow {
  id: string;
  stage_run_id: string;
  template_task_id: string;
  title: string;
  summary: string;
  status: ProcessTaskRun["status"];
  assignee: string;
  position: number;
  updated_at: string;
}

interface DeliverableRunRow {
  id: string;
  stage_run_id: string;
  template_deliverable_id: string;
  title: string;
  summary: string;
  required: number;
  status: ProcessDeliverableRun["status"];
  owner: string;
  uri: string;
  note: string;
  position: number;
  updated_at: string;
}

interface EvidenceRow {
  id: string;
  stage_run_id: string;
  type: ProcessEvidence["type"];
  label: string;
  url: string;
  summary: string;
  created_at: string;
}

interface GateRow {
  id: string;
  stage_run_id: string;
  decision: ProcessGateDecision;
  note: string;
  decided_at: string | null;
  updated_at: string;
}

interface AuditRow {
  id: string;
  entity_type: ProcessAuditEvent["entityType"];
  entity_id: string;
  action: string;
  detail: string;
  created_at: string;
}

function recordAudit(
  entityType: ProcessAuditEvent["entityType"],
  entityId: string,
  action: string,
  detail: string,
  createdAt = new Date().toISOString(),
) {
  database
    .prepare(`
      INSERT INTO process_audit_events(
        id, entity_type, entity_id, action, detail, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `)
    .run(
      `EVT-${randomUUID().slice(0, 8).toUpperCase()}`,
      entityType,
      entityId,
      action,
      detail,
      createdAt,
    );
}

function listProcessTemplates(): ProcessTemplate[] {
  const templates = database
    .prepare("SELECT * FROM process_templates ORDER BY name, version DESC")
    .all() as unknown as TemplateRow[];
  const stages = database
    .prepare("SELECT * FROM process_template_stages ORDER BY template_id, position")
    .all() as unknown as TemplateStageRow[];
  const tasks = database
    .prepare("SELECT * FROM process_template_tasks ORDER BY stage_id, position")
    .all() as unknown as TemplateTaskRow[];
  const deliverables = database
    .prepare("SELECT * FROM process_template_deliverables ORDER BY stage_id, position")
    .all() as unknown as TemplateDeliverableRow[];

  return templates.map((template) => ({
    id: template.id,
    name: template.name,
    version: template.version,
    summary: template.summary,
    createdAt: template.created_at,
    stages: stages
      .filter((stage) => stage.template_id === template.id)
      .map((stage) => ({
        id: stage.id,
        name: stage.name,
        summary: stage.summary,
        position: stage.position,
        tasks: tasks
          .filter((task) => task.stage_id === stage.id)
          .map((task) => ({
            id: task.id,
            title: task.title,
            summary: task.summary,
          })),
        deliverables: deliverables
          .filter((deliverable) => deliverable.stage_id === stage.id)
          .map((deliverable) => ({
            id: deliverable.id,
            title: deliverable.title,
            summary: deliverable.summary,
            required: deliverable.required === 1,
          })),
      })),
  }));
}

function toProject(row: ProjectRow): ProcessProject {
  return {
    id: row.id,
    name: row.name,
    summary: row.summary,
    owner: row.owner,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function loadProcessRun(row: RunRow): ProcessRun {
  const stageRows = database
    .prepare("SELECT * FROM process_stage_runs WHERE run_id = ? ORDER BY position")
    .all(row.id) as unknown as StageRunRow[];

  return {
    id: row.id,
    projectId: row.project_id,
    templateId: row.template_id,
    templateVersion: row.template_version,
    status: row.status,
    currentStageId: row.current_stage_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    stages: stageRows.map((stage): ProcessStageRun => {
      const tasks = database
        .prepare("SELECT * FROM process_task_runs WHERE stage_run_id = ? ORDER BY position")
        .all(stage.id) as unknown as TaskRunRow[];
      const gate = database
        .prepare("SELECT * FROM process_gate_decisions WHERE stage_run_id = ?")
        .get(stage.id) as unknown as GateRow;
      const deliverables = database
        .prepare("SELECT * FROM process_deliverable_runs WHERE stage_run_id = ? ORDER BY position")
        .all(stage.id) as unknown as DeliverableRunRow[];
      const evidence = database
        .prepare("SELECT * FROM process_evidence WHERE stage_run_id = ? ORDER BY created_at DESC")
        .all(stage.id) as unknown as EvidenceRow[];
      return {
        id: stage.id,
        templateStageId: stage.template_stage_id,
        name: stage.name,
        summary: stage.summary,
        status: stage.status,
        position: stage.position,
        updatedAt: stage.updated_at,
        tasks: tasks.map((task) => ({
          id: task.id,
          templateTaskId: task.template_task_id,
          title: task.title,
          summary: task.summary,
          status: task.status,
          assignee: task.assignee,
          position: task.position,
          updatedAt: task.updated_at,
        })),
        deliverables: deliverables.map((deliverable) => ({
          id: deliverable.id,
          templateDeliverableId: deliverable.template_deliverable_id,
          title: deliverable.title,
          summary: deliverable.summary,
          required: deliverable.required === 1,
          status: deliverable.status,
          owner: deliverable.owner,
          uri: deliverable.uri,
          note: deliverable.note,
          position: deliverable.position,
          updatedAt: deliverable.updated_at,
        })),
        evidence: evidence.map((item) => ({
          id: item.id,
          type: item.type,
          label: item.label,
          url: item.url,
          summary: item.summary,
          createdAt: item.created_at,
        })),
        gate: {
          id: gate.id,
          decision: gate.decision,
          note: gate.note,
          ...(gate.decided_at ? { decidedAt: gate.decided_at } : {}),
          updatedAt: gate.updated_at,
        },
      };
    }),
  };
}

function getRunRow(id: string): RunRow {
  const row = database
    .prepare("SELECT * FROM process_runs WHERE id = ?")
    .get(id) as unknown as RunRow | undefined;
  if (!row) throw new Error("Process run not found");
  return row;
}

export function loadProcessWorkspace(): ProcessWorkspaceOverview {
  const projects = database
    .prepare("SELECT * FROM process_projects ORDER BY updated_at DESC")
    .all() as unknown as ProjectRow[];
  const runs = database
    .prepare("SELECT * FROM process_runs ORDER BY updated_at DESC")
    .all() as unknown as RunRow[];
  const audits = database
    .prepare("SELECT * FROM process_audit_events ORDER BY created_at DESC LIMIT 30")
    .all() as unknown as AuditRow[];

  return {
    templates: listProcessTemplates(),
    projects: projects.map(toProject),
    runs: runs.map(loadProcessRun),
    auditEvents: audits.map((audit) => ({
      id: audit.id,
      entityType: audit.entity_type,
      entityId: audit.entity_id,
      action: audit.action,
      detail: audit.detail,
      createdAt: audit.created_at,
    })),
  };
}

export function createProcessTemplate(
  input: CreateProcessTemplateRequest,
): ProcessTemplate {
  if (input.stages.length === 0) throw new Error("At least one stage is required");
  const codes = input.stages.map((stage) => stage.code.trim().toUpperCase());
  if (codes.some((code) => !/^[A-Z][A-Z0-9_-]{0,15}$/.test(code))) {
    throw new Error("Stage codes must use 1-16 uppercase letters, numbers, _ or -");
  }
  if (new Set(codes).size !== codes.length) throw new Error("Stage codes must be unique");
  if (input.stages.some((stage) => !stage.name.trim() || !stage.summary.trim() || stage.tasks.length === 0)) {
    throw new Error("Every stage requires a name, summary, and at least one task");
  }
  const definition: TemplateDefinition = {
    ...input,
    id: `TPL-${randomUUID().slice(0, 8).toUpperCase()}-V1`,
    version: 1,
  };
  insertProcessTemplate(definition, false);
  recordAudit("template", definition.id, "created", `${definition.name} 템플릿 생성`);
  const template = listProcessTemplates().find((item) => item.id === definition.id);
  if (!template) throw new Error("Created template could not be loaded");
  return template;
}

export function createProcessProject(
  input: CreateProcessProjectRequest,
): CreateProcessProjectResponse {
  const template = listProcessTemplates().find((item) => item.id === input.templateId);
  if (!template) throw new Error("Process template not found");

  const now = new Date().toISOString();
  const projectId = `PRJ-${randomUUID().slice(0, 8).toUpperCase()}`;
  const runId = `RUN-${randomUUID().slice(0, 8).toUpperCase()}`;
  let firstStageId: string | null = null;

  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare(`
        INSERT INTO process_projects(
          id, name, summary, owner, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'active', ?, ?)
      `)
      .run(projectId, input.name.trim(), input.summary.trim(), input.owner.trim(), now, now);
    database
      .prepare(`
        INSERT INTO process_runs(
          id, project_id, template_id, template_version, status,
          current_stage_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'active', NULL, ?, ?)
      `)
      .run(runId, projectId, template.id, template.version, now, now);

    template.stages.forEach((stage, stageIndex) => {
      const stageRunId = `STG-${randomUUID().slice(0, 8).toUpperCase()}`;
      if (stageIndex === 0) firstStageId = stageRunId;
      database
        .prepare(`
          INSERT INTO process_stage_runs(
            id, run_id, template_stage_id, name, summary, status, position, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          stageRunId,
          runId,
          stage.id,
          stage.name,
          stage.summary,
          stageIndex === 0 ? "in_progress" : "pending",
          stage.position,
          now,
        );
      database
        .prepare(`
          INSERT INTO process_gate_decisions(
            id, stage_run_id, decision, note, decided_at, updated_at
          ) VALUES (?, ?, 'pending', '', NULL, ?)
        `)
        .run(`GATE-${randomUUID().slice(0, 8).toUpperCase()}`, stageRunId, now);

      stage.tasks.forEach((task, taskIndex) => {
        database
          .prepare(`
            INSERT INTO process_task_runs(
              id, stage_run_id, template_task_id, title, summary,
              status, assignee, position, updated_at
            ) VALUES (?, ?, ?, ?, ?, 'pending', '', ?, ?)
          `)
          .run(
            `TASK-${randomUUID().slice(0, 8).toUpperCase()}`,
            stageRunId,
            task.id,
            task.title,
            task.summary,
            taskIndex,
            now,
          );
      });
      stage.deliverables.forEach((deliverable, deliverableIndex) => {
        database
          .prepare(`
            INSERT INTO process_deliverable_runs(
              id, stage_run_id, template_deliverable_id, title, summary,
              required, status, owner, uri, note, position, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'pending', '', '', '', ?, ?)
          `)
          .run(
            `DEL-${randomUUID().slice(0, 8).toUpperCase()}`,
            stageRunId,
            deliverable.id,
            deliverable.title,
            deliverable.summary,
            deliverable.required ? 1 : 0,
            deliverableIndex,
            now,
          );
      });
    });
    database
      .prepare("UPDATE process_runs SET current_stage_id = ? WHERE id = ?")
      .run(firstStageId, runId);
    recordAudit("project", projectId, "created", `${template.name} 템플릿으로 프로젝트 생성`, now);
    recordAudit("run", runId, "started", "첫 번째 단계가 시작됨", now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }

  const projectRow = database
    .prepare("SELECT * FROM process_projects WHERE id = ?")
    .get(projectId) as unknown as ProjectRow;
  return { project: toProject(projectRow), run: loadProcessRun(getRunRow(runId)) };
}

export function updateProcessTask(
  runId: string,
  stageId: string,
  taskId: string,
  input: UpdateProcessTaskRequest,
): ProcessRun {
  const run = getRunRow(runId);
  if (run.status === "completed" || run.status === "cancelled") {
    throw new Error("Completed or cancelled run cannot be changed");
  }
  const stage = database
    .prepare("SELECT * FROM process_stage_runs WHERE id = ? AND run_id = ?")
    .get(stageId, runId) as unknown as StageRunRow | undefined;
  if (!stage) throw new Error("Process stage not found");
  if (run.current_stage_id !== stageId) throw new Error("Only the current stage can be changed");
  if (stage.status === "done") throw new Error("Completed stage cannot be changed");
  const task = database
    .prepare("SELECT * FROM process_task_runs WHERE id = ? AND stage_run_id = ?")
    .get(taskId, stageId) as unknown as TaskRunRow | undefined;
  if (!task) throw new Error("Process task not found");

  const now = new Date().toISOString();
  const nextAssignee = input.assignee === undefined ? task.assignee : input.assignee.trim();
  const stageStatus = input.status === "blocked" ? "blocked" : "in_progress";
  const runStatus = input.status === "blocked" ? "blocked" : "active";
  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare("UPDATE process_task_runs SET status = ?, assignee = ?, updated_at = ? WHERE id = ?")
      .run(input.status, nextAssignee, now, taskId);
    database
      .prepare("UPDATE process_stage_runs SET status = ?, updated_at = ? WHERE id = ?")
      .run(stageStatus, now, stageId);
    database
      .prepare("UPDATE process_runs SET status = ?, current_stage_id = ?, updated_at = ? WHERE id = ?")
      .run(runStatus, stageId, now, runId);
    database
      .prepare("UPDATE process_projects SET updated_at = ? WHERE id = ?")
      .run(now, run.project_id);
    recordAudit("task", taskId, "status_changed", `${task.title}: ${input.status}`, now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  return loadProcessRun(getRunRow(runId));
}

function assertCurrentMutableStage(runId: string, stageId: string) {
  const run = getRunRow(runId);
  if (run.status === "completed" || run.status === "cancelled") {
    throw new Error("Completed or cancelled run cannot be changed");
  }
  const stage = database
    .prepare("SELECT * FROM process_stage_runs WHERE id = ? AND run_id = ?")
    .get(stageId, runId) as unknown as StageRunRow | undefined;
  if (!stage) throw new Error("Process stage not found");
  if (run.current_stage_id !== stageId) throw new Error("Only the current stage can be changed");
  if (stage.status === "done") throw new Error("Completed stage cannot be changed");
  return { run, stage };
}

export function updateProcessDeliverable(
  runId: string,
  stageId: string,
  deliverableId: string,
  input: UpdateProcessDeliverableRequest,
): ProcessRun {
  const { run } = assertCurrentMutableStage(runId, stageId);
  const deliverable = database
    .prepare("SELECT * FROM process_deliverable_runs WHERE id = ? AND stage_run_id = ?")
    .get(deliverableId, stageId) as unknown as DeliverableRunRow | undefined;
  if (!deliverable) throw new Error("Process deliverable not found");
  const now = new Date().toISOString();
  const owner = input.owner === undefined ? deliverable.owner : input.owner.trim();
  const uri = input.uri === undefined ? deliverable.uri : input.uri.trim();
  const note = input.note === undefined ? deliverable.note : input.note.trim();
  if (input.status !== "pending" && !owner) throw new Error("Submitted deliverable requires an owner");
  if (input.status !== "pending" && !uri) throw new Error("Submitted deliverable requires a URI");
  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare(`
        UPDATE process_deliverable_runs
        SET status = ?, owner = ?, uri = ?, note = ?, updated_at = ? WHERE id = ?
      `)
      .run(input.status, owner, uri, note, now, deliverableId);
    database.prepare("UPDATE process_runs SET updated_at = ? WHERE id = ?").run(now, runId);
    database.prepare("UPDATE process_projects SET updated_at = ? WHERE id = ?").run(now, run.project_id);
    recordAudit("deliverable", deliverableId, "status_changed", `${deliverable.title}: ${input.status}`, now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  return loadProcessRun(getRunRow(runId));
}

export function createProcessEvidence(
  runId: string,
  stageId: string,
  input: CreateProcessEvidenceRequest,
): ProcessRun {
  const { run } = assertCurrentMutableStage(runId, stageId);
  const now = new Date().toISOString();
  const evidenceId = `EVD-${randomUUID().slice(0, 8).toUpperCase()}`;
  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare(`
        INSERT INTO process_evidence(id, stage_run_id, type, label, url, summary, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        evidenceId,
        stageId,
        input.type,
        input.label.trim(),
        input.url.trim(),
        input.summary.trim(),
        now,
      );
    database.prepare("UPDATE process_runs SET updated_at = ? WHERE id = ?").run(now, runId);
    database.prepare("UPDATE process_projects SET updated_at = ? WHERE id = ?").run(now, run.project_id);
    recordAudit("evidence", evidenceId, "submitted", `${input.type}: ${input.label.trim()}`, now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  return loadProcessRun(getRunRow(runId));
}

export function updateProcessStage(
  runId: string,
  stageId: string,
  input: UpdateProcessStageRequest,
): ProcessRun {
  const run = getRunRow(runId);
  if (run.status === "completed" || run.status === "cancelled") {
    throw new Error("Completed or cancelled run cannot be changed");
  }
  const stage = database
    .prepare("SELECT * FROM process_stage_runs WHERE id = ? AND run_id = ?")
    .get(stageId, runId) as unknown as StageRunRow | undefined;
  if (!stage) throw new Error("Process stage not found");
  if (run.current_stage_id !== stageId) throw new Error("Only the current stage can be changed");
  if (stage.status === "done") throw new Error("Completed stage cannot be changed");
  const now = new Date().toISOString();
  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare("UPDATE process_stage_runs SET status = ?, updated_at = ? WHERE id = ?")
      .run(input.status, now, stageId);
    database
      .prepare("UPDATE process_runs SET status = ?, current_stage_id = ?, updated_at = ? WHERE id = ?")
      .run(input.status === "blocked" ? "blocked" : "active", stageId, now, runId);
    database
      .prepare("UPDATE process_projects SET updated_at = ? WHERE id = ?")
      .run(now, run.project_id);
    recordAudit("stage", stageId, "status_changed", `${stage.name}: ${input.status}`, now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  return loadProcessRun(getRunRow(runId));
}

export function decideProcessGate(
  runId: string,
  stageId: string,
  input: DecideProcessGateRequest,
): ProcessRun {
  const run = getRunRow(runId);
  if (run.status === "completed" || run.status === "cancelled") {
    throw new Error("Completed or cancelled run cannot be changed");
  }
  const stage = database
    .prepare("SELECT * FROM process_stage_runs WHERE id = ? AND run_id = ?")
    .get(stageId, runId) as unknown as StageRunRow | undefined;
  if (!stage) throw new Error("Process stage not found");
  if (run.current_stage_id !== stageId) throw new Error("Only the current stage can be changed");
  const taskCount = database
    .prepare(`
      SELECT COUNT(*) AS total,
             SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done
      FROM process_task_runs WHERE stage_run_id = ?
    `)
    .get(stageId) as unknown as { total: number; done: number };
  if (input.decision === "go" && taskCount.done !== taskCount.total) {
    throw new Error("All stage tasks must be done before GO");
  }
  const deliverableCount = database
    .prepare(`
      SELECT COUNT(*) AS total,
             SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved
      FROM process_deliverable_runs WHERE stage_run_id = ? AND required = 1
    `)
    .get(stageId) as unknown as { total: number; approved: number | null };
  if (
    input.decision === "go" &&
    (deliverableCount.approved ?? 0) !== deliverableCount.total
  ) {
    throw new Error("All required deliverables must be approved before GO");
  }
  if (input.decision !== "go" && !input.note.trim()) {
    throw new Error("HOLD and KILL decisions require a note");
  }

  const now = new Date().toISOString();
  const nextStage = database
    .prepare(`
      SELECT * FROM process_stage_runs
      WHERE run_id = ? AND position > ?
      ORDER BY position LIMIT 1
    `)
    .get(runId, stage.position) as unknown as StageRunRow | undefined;

  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare(`
        UPDATE process_gate_decisions
        SET decision = ?, note = ?, decided_at = ?, updated_at = ?
        WHERE stage_run_id = ?
      `)
      .run(input.decision, input.note.trim(), now, now, stageId);

    if (input.decision === "go") {
      database
        .prepare("UPDATE process_stage_runs SET status = 'done', updated_at = ? WHERE id = ?")
        .run(now, stageId);
      if (nextStage) {
        database
          .prepare("UPDATE process_stage_runs SET status = 'in_progress', updated_at = ? WHERE id = ?")
          .run(now, nextStage.id);
        database
          .prepare("UPDATE process_runs SET status = 'active', current_stage_id = ?, updated_at = ? WHERE id = ?")
          .run(nextStage.id, now, runId);
      } else {
        database
          .prepare("UPDATE process_runs SET status = 'completed', current_stage_id = NULL, updated_at = ? WHERE id = ?")
          .run(now, runId);
      }
    } else {
      database
        .prepare("UPDATE process_stage_runs SET status = 'blocked', updated_at = ? WHERE id = ?")
        .run(now, stageId);
      database
        .prepare("UPDATE process_runs SET status = ?, current_stage_id = ?, updated_at = ? WHERE id = ?")
        .run(input.decision === "kill" ? "cancelled" : "blocked", stageId, now, runId);
    }
    database
      .prepare("UPDATE process_projects SET updated_at = ? WHERE id = ?")
      .run(now, run.project_id);
    recordAudit("gate", stageId, `decision_${input.decision}`, input.note.trim() || `${stage.name} Gate 통과`, now);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  return loadProcessRun(getRunRow(runId));
}

export function loadOperationsOverview(): ProcessOperationsOverview {
  const incidents = listIncidents();
  const resolved = incidents.filter(
    (incident) => incident.status === "resolved" && incident.resolvedAt,
  );
  const mttrHours = resolved.length
    ? resolved.reduce(
        (sum, incident) =>
          sum +
          (Date.parse(incident.resolvedAt ?? incident.updatedAt) -
            Date.parse(incident.occurredAt)) /
            3_600_000,
        0,
      ) / resolved.length
    : null;
  const documentCount = database
    .prepare("SELECT COUNT(*) AS count FROM document_index")
    .get() as unknown as { count: number };
  const syncedAt = database
    .prepare("SELECT value FROM operations_meta WHERE key = ?")
    .get("documents_synced_at") as unknown as { value: string } | undefined;

  return {
    storage: {
      engine: "sqlite",
      durability,
      schemaVersion: 3,
    },
    documents: {
      indexed: documentCount.count,
      syncedAt: syncedAt?.value ?? null,
    },
    incidents: {
      open: incidents.filter((incident) => incident.status === "open").length,
      resolved: resolved.length,
      mttrHours,
      items: incidents,
    },
  };
}

seedProcessTemplates();
backfillProcessDeliverables();
syncDocumentIndex();
