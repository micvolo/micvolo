// "documenti" attachments: POST upload (multipart form or base64 JSON), GET list, DELETE.
// The PDF lands in the DOCUMENTS R2 bucket under tracking/<slug>/<id>.pdf and is served
// through the /documents/<key> route; zero documents per project is a valid state.
// Example: curl -b cookies.txt -F slug=bloem -F name=contratto.pdf -F file=@contratto.pdf /api/admin/documenti
import { env as cloudflareEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { json, jsonError, nextRowId, readJsonObject, trackingProjectExists } from '@/lib/admin/api';
import { requireAdminApi } from '@/lib/admin/guards';
import { isSlug } from '@/lib/admin/validate';

export const prerender = false;

const MAX_PDF_BYTES = 10 * 1024 * 1024;

interface DocumentRow {
  id: string;
  slug: string;
  name: string;
  r2_key: string;
  created_at: number;
}

const COLUMNS = 'id, slug, name, r2_key, created_at';

const toApi = (row: DocumentRow) => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  createdAt: row.created_at,
  r2Key: row.r2_key,
  url: `/documents/${row.r2_key}`,
});

/** display name: a plain file name, <= 200 chars, PDF only */
const isDocumentName = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= 200
  && !/[/\\\0]/.test(value) && value.toLowerCase().endsWith('.pdf');

const isPdfBytes = (bytes: Uint8Array): boolean =>
  bytes.length > 0 && bytes.length <= MAX_PDF_BYTES && new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-';

export const GET: APIRoute = async ({ request, locals, url }) => {
  const denied = requireAdminApi(request, locals.principal);
  if (denied) return denied;
  const slug = url.searchParams.get('slug');
  const db = cloudflareEnv.DB;
  const rows = slug
    ? (await db.prepare(`SELECT ${COLUMNS} FROM tracking_documents WHERE slug = ?1 ORDER BY created_at DESC, name`).bind(slug).all<DocumentRow>()).results
    : (await db.prepare(`SELECT ${COLUMNS} FROM tracking_documents ORDER BY created_at DESC, name`).all<DocumentRow>()).results;
  return json({ documents: rows.map(toApi) });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = requireAdminApi(request, locals.principal);
  if (denied) return denied;
  const contentType = request.headers.get('Content-Type') ?? '';
  let slug: unknown;
  let name: unknown;
  let bytes: Uint8Array;
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    slug = form.get('slug');
    const file = form.get('file');
    if (!(file instanceof File)) return jsonError(400, 'missing-file');
    name = form.get('name') || file.name;
    bytes = new Uint8Array(await file.arrayBuffer());
  } else if (contentType.includes('application/json')) {
    // base64 JSON alternative: {"slug":"bloem","name":"contratto.pdf","data":"JVBERi0x..."}
    const body = await readJsonObject(request);
    if (!body || typeof body.data !== 'string' || body.data.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(body.data)) {
      return jsonError(400, 'invalid-base64');
    }
    slug = body.slug;
    name = body.name;
    bytes = Uint8Array.from(atob(body.data), (char) => char.charCodeAt(0));
  } else {
    return jsonError(415, 'unsupported-content-type');
  }
  const db = cloudflareEnv.DB;
  if (!isSlug(slug) || !(await trackingProjectExists(db, slug))) return jsonError(400, 'unknown-slug');
  if (!isDocumentName(name)) return jsonError(400, 'invalid-name');
  if (!isPdfBytes(bytes)) return jsonError(400, 'invalid-pdf');
  const id = await nextRowId(db, 'tracking_documents', 'doc', slug);
  const r2Key = `tracking/${slug}/${id}.pdf`;
  await cloudflareEnv.DOCUMENTS.put(r2Key, bytes, { httpMetadata: { contentType: 'application/pdf' } });
  const createdAt = Math.floor(Date.now() / 1000);
  try {
    await db.prepare(`INSERT INTO tracking_documents (${COLUMNS}) VALUES (?1, ?2, ?3, ?4, ?5)`)
      .bind(id, slug, name, r2Key, createdAt).run();
  } catch {
    await cloudflareEnv.DOCUMENTS.delete(r2Key);
    return jsonError(409, 'document-store');
  }
  return json(toApi({ id, slug, name, r2_key: r2Key, created_at: createdAt }), 201);
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const denied = requireAdminApi(request, locals.principal);
  if (denied) return denied;
  const id = url.searchParams.get('id');
  if (!id) return jsonError(400, 'missing-id');
  const db = cloudflareEnv.DB;
  const row = await db.prepare(`SELECT ${COLUMNS} FROM tracking_documents WHERE id = ?1 LIMIT 1`).bind(id).first<DocumentRow>();
  if (!row) return jsonError(404, 'unknown-id');
  await db.prepare('DELETE FROM tracking_documents WHERE id = ?1').bind(id).run();
  await cloudflareEnv.DOCUMENTS.delete(row.r2_key);
  return json({ ok: true, id });
};
