import { env as cloudflareEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { projectExists, requireAdminRequest } from '@/lib/admin';
import { randomId } from '@/lib/auth';

export const prerender = false;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const denied = requireAdminRequest(request, locals.principal);
  if (denied) return denied;
  const form = await request.formData();
  const projectId = String(form.get('project_id') ?? '');
  const title = String(form.get('title') ?? '').trim();
  const kind = String(form.get('kind') ?? '');
  const periodInput = String(form.get('period') ?? '');
  const period = /^\d{4}-\d{2}$/.test(periodInput) ? periodInput : null;
  const file = form.get('file');
  if (!(await projectExists(cloudflareEnv.DB, projectId)) || !title || !['contract', 'invoice', 'proposal', 'other'].includes(kind) || !(file instanceof File) || file.size <= 0 || file.size > MAX_PDF_BYTES || file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
    return redirect(`/admin/projects/${encodeURIComponent(projectId)}?error=document`, 303);
  }
  const bytes = await file.arrayBuffer();
  const signature = new TextDecoder().decode(bytes.slice(0, 5));
  if (signature !== '%PDF-') return redirect(`/admin/projects/${projectId}?error=invalid-pdf`, 303);
  const id = randomId();
  const key = `projects/${projectId}/${randomId()}.pdf`;
  await cloudflareEnv.DOCUMENTS.put(key, bytes, { httpMetadata: { contentType: 'application/pdf' } });
  try {
    await cloudflareEnv.DB.prepare(`INSERT INTO documents
      (id, project_id, kind, title, original_filename, r2_key, mime_type, size_bytes, period, uploaded_by)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'application/pdf', ?7, ?8, ?9)`)
      .bind(id, projectId, kind, title, file.name, key, file.size, period, locals.principal!.userId).run();
  } catch {
    await cloudflareEnv.DOCUMENTS.delete(key);
    return redirect(`/admin/projects/${projectId}?error=document-store`, 303);
  }
  return redirect(`/admin/projects/${projectId}?ok=document-uploaded`, 303);
};
