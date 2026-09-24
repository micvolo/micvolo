import { env as cloudflareEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { requireAdminRequest } from '@/lib/admin/guards';
import { isSlug } from '@/lib/admin/validate';
import { isEmail, normalizeEmail, randomId } from '@/lib/auth';

export const prerender = false;
export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const denied = requireAdminRequest(request, locals.principal);
  if (denied) return denied;
  const form = await request.formData();
  const clientName = String(form.get('client_name') ?? '').trim();
  const clientEmail = normalizeEmail(String(form.get('client_email') ?? ''));
  const name = String(form.get('name') ?? '').trim();
  const slug = String(form.get('slug') ?? '').trim();
  const description = String(form.get('description') ?? '').trim();
  const status = String(form.get('status') ?? 'planning');
  const estimatedHours = Number(form.get('estimated_hours'));
  if (!clientName || !isEmail(clientEmail) || !name || !isSlug(slug) || !['planning', 'active', 'paused', 'complete'].includes(status) || !Number.isFinite(estimatedHours) || estimatedHours < 0) {
    return redirect('/admin?error=validation', 303);
  }
  const userId = randomId();
  const projectId = randomId();
  try {
    await cloudflareEnv.DB.batch([
      cloudflareEnv.DB.prepare('INSERT INTO users (id, email, display_name, role) VALUES (?1, ?2, ?3, ?4)')
        .bind(userId, clientEmail, clientName, 'client'),
      cloudflareEnv.DB.prepare(`INSERT INTO projects
        (id, slug, client_user_id, name, description, status, estimated_minutes, hourly_rate_cents, currency)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 4000, 'EUR')`)
        .bind(projectId, slug, userId, name, description, status, Math.round(estimatedHours * 60)),
    ]);
    return redirect(`/admin/projects/${projectId}?ok=project-created`, 303);
  } catch {
    return redirect('/admin?error=conflict', 303);
  }
};
