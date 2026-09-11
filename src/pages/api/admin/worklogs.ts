import { env as cloudflareEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { projectExists, requireAdminRequest, validDate } from '@/lib/admin';
import { randomId } from '@/lib/auth';

export const prerender = false;
export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const denied = requireAdminRequest(request, locals.principal);
  if (denied) return denied;
  const form = await request.formData();
  const projectId = String(form.get('project_id') ?? '');
  const workedOn = String(form.get('worked_on') ?? '');
  const hours = Number(form.get('hours'));
  const category = String(form.get('category') ?? '');
  const publicNote = String(form.get('public_note') ?? '').trim();
  const privateNote = String(form.get('private_note') ?? '').trim();
  const minutes = Math.round(hours * 60);
  if (!(await projectExists(cloudflareEnv.DB, projectId)) || !validDate(workedOn) || !Number.isFinite(hours) || minutes < 15 || minutes > 1440 || !['strategy', 'design', 'development', 'meeting', 'content', 'maintenance'].includes(category) || !publicNote) {
    return redirect(`/admin/projects/${encodeURIComponent(projectId)}?error=worklog`, 303);
  }
  await cloudflareEnv.DB.prepare(`INSERT INTO worklogs
    (id, project_id, worked_on, minutes, category, public_note, private_note, created_by)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`)
    .bind(randomId(), projectId, workedOn, minutes, category, publicNote, privateNote, locals.principal!.userId).run();
  return redirect(`/admin/projects/${projectId}?ok=work-added`, 303);
};
