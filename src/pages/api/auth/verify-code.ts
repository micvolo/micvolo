import { env as cloudflareEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { CHALLENGE_COOKIE, isDevelopment, sessionCookieName, verifyOtp } from '@/lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, cookies, redirect, url }) => {
  if (request.headers.get('Origin') !== url.origin) return new Response('Forbidden', { status: 403 });
  const form = await request.formData();
  const role = form.get('role') === 'admin' ? 'admin' : 'client';
  const code = String(form.get('code') ?? '').replace(/\s/g, '');
  const challengeId = cookies.get(CHALLENGE_COOKIE)?.value ?? '';
  const result = challengeId ? await verifyOtp(cloudflareEnv.DB, cloudflareEnv, challengeId, code, role) : null;
  const login = role === 'admin' ? '/admin/login' : '/portal/login';
  if (!result) return redirect(`${login}?sent=1&error=code`, 303);

  const env = cloudflareEnv;
  cookies.set(sessionCookieName(env, url), result.token, {
    httpOnly: true,
    secure: !isDevelopment(env, url),
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  cookies.delete(CHALLENGE_COOKIE, { path: '/' });
  return redirect(role === 'admin' ? '/admin' : '/portal', 303);
};
