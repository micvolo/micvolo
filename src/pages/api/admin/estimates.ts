// CRUD for preventivo rows (EstimateDoc): GET list, POST create (base or extension),
// PUT update, DELETE. The PDF itself is uploaded by the user to
// public/preventivi/<slug>/<file>.pdf — this endpoint only stores the row + pdfUrl.
// Example: POST /api/admin/estimates {"slug":"abitare-in-legno","date":"2026-10-05","hours":20,"note":"il cliente chiede le pagine cantieri — stimo 20 ore a 800 euro","pdfUrl":"/preventivi/abitare-in-legno/est_abitare-in-legno_04.pdf"}
import { env as cloudflareEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { json, jsonError, nextRowId, readJsonObject, trackingProjectExists } from '@/lib/admin/api';
import { requireAdminApi } from '@/lib/admin/guards';
import { isIsoDate, isNoteLine, isPositiveNumber, isSlug } from '@/lib/admin/validate';

export const prerender = false;

interface EstimateRow {
  id: string;
  slug: string;
  date: string;
  hours: number;
  amount: number;
  note: string;
  pdf_url: string;
}

const COLUMNS = 'id, slug, date, hours, amount, note, pdf_url';

/** estimate note voice: first person "stimo N ore a M euro" (a short reason may precede it) */
const ESTIMATE_NOTE = /stimo \d+ ore a \d+ euro/;

const toApi = (row: EstimateRow) => ({
  id: row.id, slug: row.slug, date: row.date, hours: row.hours,
  amount: row.amount, note: row.note, pdfUrl: row.pdf_url,
});

const isPdfUrl = (value: unknown, slug: string): value is string =>
  typeof value === 'string' && new RegExp(`^/preventivi/${slug}/[^/]+\\.pdf$`).test(value);

export const GET: APIRoute = async ({ request, locals, url }) => {
  const denied = requireAdminApi(request, locals.principal);
  if (denied) return denied;
  const slug = url.searchParams.get('slug');
  const db = cloudflareEnv.DB;
  const rows = slug
    ? (await db.prepare(`SELECT ${COLUMNS} FROM estimate_docs WHERE slug = ?1 ORDER BY date, id`).bind(slug).all<EstimateRow>()).results
    : (await db.prepare(`SELECT ${COLUMNS} FROM estimate_docs ORDER BY date, id`).all<EstimateRow>()).results;
  return json({ estimates: rows.map(toApi) });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = requireAdminApi(request, locals.principal);
  if (denied) return denied;
  const body = await readJsonObject(request);
  if (!body) return jsonError(400, 'invalid-json');
  const { slug, date, hours, note, pdfUrl } = body;
  const db = cloudflareEnv.DB;
  if (!isSlug(slug) || !(await trackingProjectExists(db, slug))) return jsonError(400, 'unknown-slug');
  if (!isIsoDate(date)) return jsonError(400, 'invalid-date');
  if (!isPositiveNumber(hours)) return jsonError(400, 'invalid-hours');
  if (!isNoteLine(note) || !ESTIMATE_NOTE.test(note)) return jsonError(400, 'invalid-note');
  if (!isPdfUrl(pdfUrl, slug)) return jsonError(400, 'invalid-pdf-url');
  // invariant: amount = hours × project rate (existing amounts stay snapshots of their quote)
  const rate = (await db.prepare('SELECT rate FROM tracking_projects WHERE slug = ?1').bind(slug).first<{ rate: number }>())!.rate;
  const amount = body.amount === undefined ? hours * rate : body.amount;
  if (typeof amount !== 'number' || !Number.isFinite(amount) || Math.abs(amount - (hours as number) * rate) > 0.01) {
    return jsonError(400, 'invalid-amount');
  }
  const id = body.id === undefined ? await nextRowId(db, 'estimate_docs', 'est', slug) : body.id;
  if (typeof id !== 'string' || !/^est_[a-z0-9-]+_\d{2,}$/.test(id)) return jsonError(400, 'invalid-id');
  try {
    await db.prepare(`INSERT INTO estimate_docs (${COLUMNS}) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`)
      .bind(id, slug, date, hours, amount, note, pdfUrl).run();
  } catch {
    return jsonError(409, 'duplicate-id');
  }
  return json({ id, slug, date, hours, amount, note, pdfUrl }, 201);
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const denied = requireAdminApi(request, locals.principal);
  if (denied) return denied;
  const body = await readJsonObject(request);
  if (!body || typeof body.id !== 'string') return jsonError(400, 'invalid-json');
  const db = cloudflareEnv.DB;
  const current = await db.prepare(`SELECT ${COLUMNS} FROM estimate_docs WHERE id = ?1 LIMIT 1`).bind(body.id).first<EstimateRow>();
  if (!current) return jsonError(404, 'unknown-id');
  const date = body.date === undefined ? current.date : body.date;
  const hours = body.hours === undefined ? current.hours : body.hours;
  const note = body.note === undefined ? current.note : body.note;
  const pdfUrl = body.pdfUrl === undefined ? current.pdf_url : body.pdfUrl;
  if (!isIsoDate(date)) return jsonError(400, 'invalid-date');
  if (!isPositiveNumber(hours)) return jsonError(400, 'invalid-hours');
  if (!isNoteLine(note) || !ESTIMATE_NOTE.test(note)) return jsonError(400, 'invalid-note');
  if (!isPdfUrl(pdfUrl, current.slug)) return jsonError(400, 'invalid-pdf-url');
  let amount: unknown = current.amount;
  if (body.hours !== undefined || body.amount !== undefined) {
    // touching hours/amount re-asserts the invariant; note-only edits keep the historical amount
    const rate = (await db.prepare('SELECT rate FROM tracking_projects WHERE slug = ?1').bind(current.slug).first<{ rate: number }>())!.rate;
    amount = body.amount === undefined ? (hours as number) * rate : body.amount;
    if (typeof amount !== 'number' || !Number.isFinite(amount) || Math.abs(amount - (hours as number) * rate) > 0.01) {
      return jsonError(400, 'invalid-amount');
    }
  }
  await db.prepare('UPDATE estimate_docs SET date = ?2, hours = ?3, amount = ?4, note = ?5, pdf_url = ?6 WHERE id = ?1')
    .bind(current.id, date, hours, amount, note, pdfUrl).run();
  return json({ id: current.id, slug: current.slug, date, hours, amount, note, pdfUrl });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const denied = requireAdminApi(request, locals.principal);
  if (denied) return denied;
  const id = url.searchParams.get('id');
  if (!id) return jsonError(400, 'missing-id');
  const result = await cloudflareEnv.DB.prepare('DELETE FROM estimate_docs WHERE id = ?1').bind(id).run();
  if (!result.meta.changes) return jsonError(404, 'unknown-id');
  return json({ ok: true, id });
};
