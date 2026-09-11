export function requireAdminRequest(request: Request, principal: Principal | null): Response | null {
  if (request.headers.get('Origin') !== new URL(request.url).origin) return new Response('Forbidden', { status: 403 });
  if (principal?.role !== 'admin') return new Response('Unauthorized', { status: 401 });
  return null;
}

export async function projectExists(db: D1Database, projectId: string): Promise<boolean> {
  return Boolean(await db.prepare('SELECT id FROM projects WHERE id = ?1 LIMIT 1').bind(projectId).first());
}

export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
