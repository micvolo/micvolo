export const prerender = false;

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const POST: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  const db = env.DB;
  const r2 = env.R2;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const name = (formData.get('name') as string | null)?.trim();

  if (!file || !name) {
    return new Response(JSON.stringify({ error: 'Missing file or name' }), { status: 400 });
  }

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return new Response(JSON.stringify({ error: 'Only PDF files are allowed' }), { status: 400 });
  }

  if (file.size > 20 * 1024 * 1024) {
    return new Response(JSON.stringify({ error: 'File too large (max 20 MB)' }), { status: 400 });
  }

  const r2Key = `projects/${slug}/docs/${crypto.randomUUID()}.pdf`;

  await r2.put(r2Key, file.stream(), {
    httpMetadata: { contentType: 'application/pdf' },
  });

  const doc = await db
    .prepare('INSERT INTO ProjectDocument (project_slug, name, r2_key, size_bytes) VALUES (?, ?, ?, ?) RETURNING *')
    .bind(slug, name, r2Key, file.size)
    .first();

  return new Response(JSON.stringify(doc), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
