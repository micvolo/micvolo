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
  const invoiceId = String(form.get('invoice_id') ?? '') || null;
  const amount = Number(form.get('amount'));
  const amountCents = Math.round(amount * 100);
  const paidOn = String(form.get('paid_on') ?? '');
  const method = String(form.get('method') ?? '').trim();
  const reference = String(form.get('reference') ?? '').trim();
  const invoice = invoiceId
    ? await cloudflareEnv.DB.prepare("SELECT id FROM invoices WHERE id = ?1 AND project_id = ?2 AND status != 'void' LIMIT 1").bind(invoiceId, projectId).first()
    : true;
  if (!(await clientProjectExists(cloudflareEnv.DB, projectId)) || !invoice || !Number.isFinite(amount) || amountCents <= 0 || !validDate(paidOn) || !method) {
    return redirect(`/admin/projects/${encodeURIComponent(projectId)}?error=payment`, 303);
  }
  const statements = [cloudflareEnv.DB.prepare(`INSERT INTO payments
    (id, project_id, invoice_id, amount_cents, paid_on, method, reference)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`).bind(randomId(), projectId, invoiceId, amountCents, paidOn, method, reference)];
  if (invoiceId) statements.push(cloudflareEnv.DB.prepare(`UPDATE invoices SET status = 'paid'
    WHERE id = ?1 AND status != 'void'
      AND total_cents <= COALESCE((SELECT SUM(amount_cents) FROM payments WHERE invoice_id = ?1), 0)`).bind(invoiceId));
  await cloudflareEnv.DB.batch(statements);
  return redirect(`/admin/projects/${projectId}?ok=payment-recorded`, 303);
};
