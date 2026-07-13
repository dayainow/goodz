import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import type {
  CreateProcessIncidentRequest,
  ProcessIncident,
  ProcessOperationsOverview,
} from "@goodz/types";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const docsRoot = path.join(repoRoot, "docs");
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

  INSERT OR IGNORE INTO schema_migrations(version, applied_at)
  VALUES (1, datetime('now'));
`);

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
      schemaVersion: 1,
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

syncDocumentIndex();
