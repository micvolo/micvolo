// Shared JSON helpers, body parsing and row helpers for the reserved-area CRUD
// APIs (src/pages/api/admin/*). Auth is the existing admin session: middleware
// resolves locals.principal through auth.getPrincipal(), and these endpoints
// accept only that principal with role 'admin' (see ./guards.ts).
import { isSlug } from './validate';

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export function jsonError(status: number, error: string): Response {
  return json({ error }, status);
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body !== null && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

/** client-project row exists in the `projects` table (one project per client) */
export async function clientProjectExists(db: D1Database, projectId: string): Promise<boolean> {
  return Boolean(await db.prepare('SELECT id FROM projects WHERE id = ?1 LIMIT 1').bind(projectId).first());
}

/** tracking row exists in the `tracking_projects` table (the admin work ledger) */
export async function trackingProjectExists(db: D1Database, slug: unknown): Promise<boolean> {
  return isSlug(slug) && Boolean(await db.prepare('SELECT 1 AS hit FROM tracking_projects WHERE slug = ?1 LIMIT 1').bind(slug).first());
}

/** next est_<slug>_<NN> / log_<slug>_<NN> / doc_<slug>_<NN> id, continuing after deleted rows */
export async function nextRowId(db: D1Database, table: 'estimate_docs' | 'time_entries' | 'tracking_documents', prefix: string, slug: string): Promise<string> {
  const stem = `${prefix}_${slug}_`;
  const { results: rows } = await db.prepare(`SELECT id FROM ${table} WHERE id GLOB ?1`).bind(`${stem}*`).all<{ id: string }>();
  let next = 1;
  for (const row of rows) {
    const suffix = row.id.slice(stem.length);
    if (/^\d+$/.test(suffix)) next = Math.max(next, Number(suffix) + 1);
  }
  return `${stem}${String(next).padStart(2, '0')}`;
}
