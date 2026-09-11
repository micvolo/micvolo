import { env as cloudflareEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { requireAdminRequest, validDate } from '@/lib/admin';
import { randomId } from '@/lib/auth';

export const prerender = false;
export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const denied = requireAdminRequest(request, locals.principal);
  if (denied) return denied;
  const form = await request.formData();
  const projectId = String(form.get('project_id') ?? '');
  const number = String(form.get('number') ?? '').trim();
  const description = String(form.get('description') ?? '').trim();
  const periodStart = String(form.get('period_start') ?? '');
  const periodEnd = String(form.get('period_end') ?? '');
  const issuedOn = String(form.get('issued_on') ?? '');
  const dueOn = String(form.get('due_on') ?? '');
  const status = String(form.get('status') ?? 'draft');
  const hours = Number(form.get('hours'));
  const project = await cloudflareEnv.DB.prepare('SELECT id, hourly_rate_cents FROM projects WHERE id = ?1 LIMIT 1').bind(projectId).first<{ id: string; hourly_rate_cents: number }>();
  const minutes = Math.round(hours * 60);
  if (!project || !number || !description || ![periodStart, periodEnd, issuedOn, dueOn].every(validDate) || periodStart > periodEnd || !['draft', 'issued'].includes(status) || !Number.isFinite(hours) || minutes < 0) {
    return redirect(`/admin/projects/${encodeURIComponent(projectId)}?error=invoice`, 303);
  }
  const invoiceId = randomId();
  const amount = Math.round(minutes * project.hourly_rate_cents / 60);
  try {
    await cloudflareEnv.DB.batch([
      cloudflareEnv.DB.prepare(`INSERT INTO invoices
        (id, project_id, number, period_start, period_end, issued_on, due_on, status, subtotal_cents, total_cents)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?9)`)
        .bind(invoiceId, projectId, number, periodStart, periodEnd, issuedOn, dueOn, status, amount),
      cloudflareEnv.DB.prepare(`INSERT INTO invoice_lines
        (id, invoice_id, description, quantity_minutes, unit_rate_cents, amount_cents)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)`)
        .bind(randomId(), invoiceId, description, minutes, project.hourly_rate_cents, amount),
    ]);
    return redirect(`/admin/projects/${projectId}?ok=invoice-created`, 303);
  } catch {
    return redirect(`/admin/projects/${projectId}?error=invoice-conflict`, 303);
  }
};
