// Access guards for the reserved area and its APIs: session role checks,
// project ownership and same-origin enforcement on mutations. The identity
// behind the principal lives in src/lib/auth.ts.
import { jsonError } from './api';

export function requireAdmin(principal: Principal | null): principal is Principal & { role: 'admin' } {
  return principal?.role === 'admin';
}

/** mutation guard for the ledger endpoints: explicit Origin must match, admin role always */
export function requireAdminRequest(request: Request, principal: Principal | null): Response | null {
  if (request.headers.get('Origin') !== new URL(request.url).origin) return new Response('Forbidden', { status: 403 });
  if (principal?.role !== 'admin') return new Response('Unauthorized', { status: 401 });
  return null;
}

/** admin-session guard for the tracking CRUD API: same-origin when a browser sends Origin, admin role always */
export function requireAdminApi(request: Request, principal: Principal | null): Response | null {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return jsonError(403, 'forbidden');
  if (principal?.role !== 'admin') return jsonError(401, 'unauthorized');
  return null;
}

export async function canAccessProject(db: D1Database, principal: Principal, projectId: string): Promise<boolean> {
  if (principal.role === 'admin') return true;
  const project = await db.prepare('SELECT id FROM projects WHERE id = ?1 AND client_user_id = ?2 LIMIT 1')
    .bind(projectId, principal.userId).first();
  return Boolean(project);
}

export function redirectToLogin(role: 'admin' | 'client'): Response {
  return Response.redirect(role === 'admin' ? '/admin/login' : '/portal/login', 302);
}
