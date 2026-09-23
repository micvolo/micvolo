// CRUD for tracking project rows (the AdminProject shell): GET list, POST create,
// PUT update (title / description / rate), DELETE (cascades its rows, removes its R2 files).
// Example: PUT /api/admin/tracking-projects {"slug":"bloem","rate":25}
import { env as cloudflareEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { DEFAULT_RATE_EUR } from '@/lib/admin-data';
import { isPositiveNumber, isSlug, json, jsonError, readJsonObject, requireAdminApi } from '@/lib/admin-data/api';

export const prerender = false;

interface ProjectRow {
  slug: string;
  title: string;
  description: string;
  rate: number;
}

const COLUMNS = 'slug, title, description, rate';

export const GET: APIRoute = async ({ request, locals }) => {
  const denied = requireAdminApi(request, locals.principal);
  if (denied) return denied;
  const rows = (await cloudflareEnv.DB.prepare(`SELECT ${COLUMNS} FROM tracking_projects ORDER BY sort_order, slug`).all<ProjectRow>()).results;
  return json({ projects: rows });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = requireAdminApi(request, locals.principal);
  if (denied) return denied;
  const body = await readJsonObject(request);
  if (!body) return jsonError(400, 'invalid-json');
  const { slug, title, description, rate } = body;
  if (!isSlug(slug)) return jsonError(400, 'invalid-slug');
  if (typeof title !== 'string' || !title.trim() || title.trim() !== title) return jsonError(400, 'invalid-title');
  if (description !== undefined && typeof description !== 'string') return jsonError(400, 'invalid-description');
  const rowRate = rate === undefined ? DEFAULT_RATE_EUR : rate;
  if (!isPositiveNumber(rowRate)) return jsonError(400, 'invalid-rate');
  const db = cloudflareEnv.DB;
  const row: ProjectRow = {
    slug,
    title,
    description: typeof description === 'string' ? description : '',
    rate: rowRate,
  };
  try {
    await db.prepare(`INSERT INTO tracking_projects (slug, title, description, rate, sort_order)
      VALUES (?1, ?2, ?3, ?4, COALESCE((SELECT MAX(sort_order) FROM tracking_projects), -1) + 1)`)
      .bind(row.slug, row.title, row.description, row.rate).run();
  } catch {
    return jsonError(409, 'duplicate-slug');
  }
  return json(row, 201);
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const denied = requireAdminApi(request, locals.principal);
  if (denied) return denied;
  const body = await readJsonObject(request);
  if (!body || !isSlug(body.slug)) return jsonError(400, 'invalid-slug');
  const db = cloudflareEnv.DB;
  const current = await db.prepare(`SELECT ${COLUMNS} FROM tracking_projects WHERE slug = ?1 LIMIT 1`).bind(body.slug).first<ProjectRow>();
  if (!current) return jsonError(404, 'unknown-slug');
  const title = body.title === undefined ? current.title : body.title;
  const description = body.description === undefined ? current.description : body.description;
  const rate = body.rate === undefined ? current.rate : body.rate;
  if (typeof title !== 'string' || !title.trim() || title.trim() !== title) return jsonError(400, 'invalid-title');
  if (typeof description !== 'string') return jsonError(400, 'invalid-description');
  if (!isPositiveNumber(rate)) return jsonError(400, 'invalid-rate');
  await db.prepare('UPDATE tracking_projects SET title = ?2, description = ?3, rate = ?4 WHERE slug = ?1')
    .bind(current.slug, title, description, rate).run();
  return json({ slug: current.slug, title, description, rate });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const denied = requireAdminApi(request, locals.principal);
  if (denied) return denied;
  const slug = url.searchParams.get('slug');
  if (!slug) return jsonError(400, 'missing-slug');
  const db = cloudflareEnv.DB;
  const files = (await db.prepare('SELECT r2_key FROM tracking_documents WHERE slug = ?1').bind(slug).all<{ r2_key: string }>()).results;
  // explicit child deletes + one batch: deterministic even when foreign_keys is off
  const result = await db.batch([
    db.prepare('DELETE FROM time_entries WHERE slug = ?1').bind(slug),
    db.prepare('DELETE FROM estimate_docs WHERE slug = ?1').bind(slug),
    db.prepare('DELETE FROM tracking_documents WHERE slug = ?1').bind(slug),
    db.prepare('DELETE FROM tracking_projects WHERE slug = ?1').bind(slug),
  ]);
  if (!result[result.length - 1].meta.changes) return jsonError(404, 'unknown-slug');
  await Promise.all(files.map((file) => cloudflareEnv.DOCUMENTS.delete(file.r2_key)));
  return json({ ok: true, slug });
};
