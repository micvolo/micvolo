export const prerender = false;

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

interface DocRow {
  id: number;
  name: string;
  r2_key: string;
  size_bytes: number;
}

export const GET: APIRoute = async ({ params }) => {
  const { slug, id } = params;
  const db = env.DB;
  const r2 = env.R2;

  const doc = await db
    .prepare('SELECT * FROM ProjectDocument WHERE id = ? AND project_slug = ?')
    .bind(Number(id), slug)
    .first<DocRow>();

  if (!doc) return new Response('Not found', { status: 404 });

  const object = await r2.get(doc.r2_key);
  if (!object) return new Response('File not found', { status: 404 });

  const safeName = doc.name.replace(/[^\w\s\-_.]/g, '').trim() || 'document';

  return new Response(object.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${safeName}.pdf"`,
    },
  });
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const { slug, id } = params;
  const db = env.DB;

  const body = await request.json() as { is_quote?: boolean };

  if (body.is_quote === true) {
    await db.prepare('UPDATE ProjectDocument SET is_quote = 0 WHERE project_slug = ?').bind(slug).run();
    await db.prepare('UPDATE ProjectDocument SET is_quote = 1 WHERE id = ? AND project_slug = ?').bind(Number(id), slug).run();
  } else if (body.is_quote === false) {
    await db.prepare('UPDATE ProjectDocument SET is_quote = 0 WHERE id = ? AND project_slug = ?').bind(Number(id), slug).run();
  }

  return new Response(null, { status: 204 });
};

export const DELETE: APIRoute = async ({ params }) => {
  const { slug, id } = params;
  const db = env.DB;
  const r2 = env.R2;

  const doc = await db
    .prepare('SELECT id, r2_key FROM ProjectDocument WHERE id = ? AND project_slug = ?')
    .bind(Number(id), slug)
    .first<DocRow>();

  if (!doc) return new Response('Not found', { status: 404 });

  await r2.delete(doc.r2_key);
  await db.prepare('DELETE FROM ProjectDocument WHERE id = ?').bind(Number(id)).run();

  return new Response(null, { status: 204 });
};
