import { env as cloudflareEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { canAccessProject } from '@/lib/admin/guards';

export const prerender = false;
interface StoredDocument { id: string; project_id: string; original_filename: string; r2_key: string; mime_type: string; size_bytes: number; }

export const GET: APIRoute = async ({ params, locals }) => {
  const principal = locals.principal;
  if (!principal) return new Response('Unauthorized', { status: 401 });
  const db = cloudflareEnv.DB;
  const document = await db.prepare('SELECT id, project_id, original_filename, r2_key, mime_type, size_bytes FROM documents WHERE r2_key = ?1 LIMIT 1')
    .bind(params.key).first<StoredDocument>();
  if (!document || !(await canAccessProject(db, principal, document.project_id))) return new Response('Not found', { status: 404 });
  const object = await cloudflareEnv.DOCUMENTS.get(document.r2_key);
  if (!object) return new Response('Not found', { status: 404 });
  const asciiName = document.original_filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'document.pdf';
  const encodedName = encodeURIComponent(document.original_filename).replace(/[']/g, '%27');
  const headers = new Headers({
    'Content-Type': 'application/pdf',
    'Content-Length': String(document.size_bytes),
    'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; sandbox",
    'ETag': object.httpEtag,
  });
  return new Response(object.body, { headers });
};
