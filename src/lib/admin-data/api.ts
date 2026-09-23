// Shared JSON helpers and strict validators for the admin tracking CRUD API
// (src/pages/api/admin/{entries,estimates,tracking-projects,documenti}.ts).
// Auth is the existing admin session: middleware resolves locals.principal through
// auth.getPrincipal(), and these endpoints accept only that principal with role 'admin'.
import { validDate } from '@/lib/admin';

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export function jsonError(status: number, error: string): Response {
  return json({ error }, status);
}

/** admin-session guard: same-origin when a browser sends Origin, admin role always */
export function requireAdminApi(request: Request, principal: Principal | null): Response | null {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return jsonError(403, 'forbidden');
  if (principal?.role !== 'admin') return jsonError(401, 'unauthorized');
  return null;
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body !== null && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export function isSlug(value: unknown): value is string {
  return typeof value === 'string' && SLUG_PATTERN.test(value);
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && validDate(value);
}

/** note voice: non-empty lowercase log line without a final period */
export function isNoteLine(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim() === value
    && value[0] === value[0].toLowerCase() && !value.endsWith('.');
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
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

export async function projectExists(db: D1Database, slug: unknown): Promise<boolean> {
  return isSlug(slug) && Boolean(await db.prepare('SELECT 1 AS hit FROM tracking_projects WHERE slug = ?1 LIMIT 1').bind(slug).first());
}
