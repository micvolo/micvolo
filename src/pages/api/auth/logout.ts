import { env as cloudflareEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { isDevelopment, revokeSession, sessionCookieName } from '@/lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, cookies, redirect, url }) => {
  if (request.headers.get('Origin') !== url.origin) return new Response('Forbidden', { status: 403 });
  const env = cloudflareEnv;
  const name = sessionCookieName(env, url);
  await revokeSession(env.DB, cookies.get(name)?.value);
  cookies.delete(name, { path: '/', secure: !isDevelopment(env, url), sameSite: 'lax' });
  return redirect('/', 303);
};
