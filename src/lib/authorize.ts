export function requireAdmin(principal: Principal | null): principal is Principal & { role: 'admin' } {
  return principal?.role === 'admin';
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
