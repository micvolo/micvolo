// CRUD for work-log rows (TimeEntry): GET list, POST create, PUT update, DELETE.
// Example: POST /api/admin/entries {"slug":"abitare-in-legno","date":"2026-09-22","hours":3,"note":"pulizia finale delle schede appartamento"}
import { env as cloudflareEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { json, jsonError, nextRowId, readJsonObject, trackingProjectExists } from '@/lib/admin/api';
import { requireAdminApi } from '@/lib/admin/guards';
import { isIsoDate, isNoteLine, isSlug } from '@/lib/admin/validate';

export const prerender = false;

interface EntryRow {
  id: string;
  slug: string;
  date: string;
  hours: number;
  note: string;
}

const COLUMNS = 'id, slug, date, hours, note';

export const GET: APIRoute = async ({ request, locals, url }) => {
  const denied = requireAdminApi(request, locals.principal);
  if (denied) return denied;
  const slug = url.searchParams.get('slug');
  const db = cloudflareEnv.DB;
  const rows = slug
    ? (await db.prepare(`SELECT ${COLUMNS} FROM time_entries WHERE slug = ?1 ORDER BY date, id`).bind(slug).all<EntryRow>()).results
    : (await db.prepare(`SELECT ${COLUMNS} FROM time_entries ORDER BY date, id`).all<EntryRow>()).results;
  return json({ entries: rows });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = requireAdminApi(request, locals.principal);
  if (denied) return denied;
  const body = await readJsonObject(request);
  if (!body) return jsonError(400, 'invalid-json');
  const { slug, date, hours, note } = body;
  if (!isSlug(slug) || !(await trackingProjectExists(cloudflareEnv.DB, slug))) return jsonError(400, 'unknown-slug');
  if (!isIsoDate(date)) return jsonError(400, 'invalid-date');
  if (!Number.isInteger(hours) || (hours as number) < 1 || (hours as number) > 8) return jsonError(400, 'invalid-hours');
  if (!isNoteLine(note)) return jsonError(400, 'invalid-note');
  const db = cloudflareEnv.DB;
  const id = body.id === undefined ? await nextRowId(db, 'time_entries', 'log', slug) : body.id;
  if (typeof id !== 'string' || !/^log_[a-z0-9-]+_\d{2,}$/.test(id)) return jsonError(400, 'invalid-id');
  try {
    await db.prepare(`INSERT INTO time_entries (${COLUMNS}) VALUES (?1, ?2, ?3, ?4, ?5)`)
      .bind(id, slug, date, hours, note).run();
  } catch {
    return jsonError(409, 'duplicate-id');
  }
  return json({ id, slug, date, hours, note }, 201);
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const denied = requireAdminApi(request, locals.principal);
  if (denied) return denied;
  const body = await readJsonObject(request);
  if (!body || typeof body.id !== 'string') return jsonError(400, 'invalid-json');
  const db = cloudflareEnv.DB;
  const current = await db.prepare(`SELECT ${COLUMNS} FROM time_entries WHERE id = ?1 LIMIT 1`).bind(body.id).first<EntryRow>();
  if (!current) return jsonError(404, 'unknown-id');
  const date = body.date === undefined ? current.date : body.date;
  const hours = body.hours === undefined ? current.hours : body.hours;
  const note = body.note === undefined ? current.note : body.note;
  if (!isIsoDate(date)) return jsonError(400, 'invalid-date');
  if (!Number.isInteger(hours) || (hours as number) < 1 || (hours as number) > 8) return jsonError(400, 'invalid-hours');
  if (!isNoteLine(note)) return jsonError(400, 'invalid-note');
  await db.prepare('UPDATE time_entries SET date = ?2, hours = ?3, note = ?4 WHERE id = ?1')
    .bind(current.id, date, hours, note).run();
  return json({ id: current.id, slug: current.slug, date, hours, note });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const denied = requireAdminApi(request, locals.principal);
  if (denied) return denied;
  const id = url.searchParams.get('id');
  if (!id) return jsonError(400, 'missing-id');
  const result = await cloudflareEnv.DB.prepare('DELETE FROM time_entries WHERE id = ?1').bind(id).run();
  if (!result.meta.changes) return jsonError(404, 'unknown-id');
  return json({ ok: true, id });
};
