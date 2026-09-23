import { env as cloudflareEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { CHALLENGE_COOKIE, isDevelopment, SESSION_TTL_SECONDS, sessionCookieName, verifyOtp } from '@/lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, cookies, redirect, url }) => {
  if (request.headers.get('Origin') !== url.origin) return new Response('Forbidden', { status: 403 });
  const form = await request.formData();
  const code = String(form.get('code') ?? '').replace(/\s/g, '');
  const challengeId = cookies.get(CHALLENGE_COOKIE)?.value ?? '';
  // Single access point: the requested role lives on the stored challenge, so
  // the form cannot steer verification or the destination area.
  const challenge = challengeId
    ? await cloudflareEnv.DB.prepare('SELECT requested_role FROM otp_challenges WHERE id = ?1')
        .bind(challengeId).first<{ requested_role: 'admin' | 'client' }>()
    : null;
  const result = challenge ? await verifyOtp(cloudflareEnv.DB, cloudflareEnv, challengeId, code, challenge.requested_role) : null;
  if (!result) return redirect('/portal/login?sent=1&error=code', 303);

  const env = cloudflareEnv;
  cookies.set(sessionCookieName(env, url), result.token, {
    httpOnly: true,
    secure: !isDevelopment(env, url),
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
  cookies.delete(CHALLENGE_COOKIE, { path: '/' });
  return redirect(result.principal.role === 'admin' ? '/admin' : '/portal', 303);
};
