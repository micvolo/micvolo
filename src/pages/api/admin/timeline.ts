import { env as cloudflareEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { clientProjectExists } from '@/lib/admin/api';
import { requireAdminRequest } from '@/lib/admin/guards';
import { validDate } from '@/lib/admin/validate';
import { randomId } from '@/lib/auth';

export const prerender = false;
export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const denied = requireAdminRequest(request, locals.principal);
  if (denied) return denied;
  const form = await request.formData();
  const projectId = String(form.get('project_id') ?? '');
  const kind = String(form.get('kind') ?? '');
  const title = String(form.get('title') ?? '').trim();
  const body = String(form.get('body') ?? '').trim();
  const visibility = String(form.get('visibility') ?? '');
  const occurredOn = String(form.get('occurred_on') ?? '');
  if (!(await clientProjectExists(cloudflareEnv.DB, projectId)) || !['milestone', 'update', 'decision', 'delivery'].includes(kind) || !['public', 'private'].includes(visibility) || !validDate(occurredOn) || !title) {
    return redirect(`/admin/projects/${encodeURIComponent(projectId)}?error=timeline`, 303);
  }
  const occurredAt = Math.floor(Date.parse(`${occurredOn}T12:00:00Z`) / 1000);
  await cloudflareEnv.DB.prepare(`INSERT INTO timeline_events
    (id, project_id, kind, title, body, visibility, occurred_at, created_by)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`)
    .bind(randomId(), projectId, kind, title, body, visibility, occurredAt, locals.principal!.userId).run();
  return redirect(`/admin/projects/${projectId}?ok=timeline-added`, 303);
};
