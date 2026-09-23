import { env as cloudflareEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { CHALLENGE_COOKIE, isDevelopment, normalizeEmail, randomId, requestOtp } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, cookies, redirect, url }) => {
  if (request.headers.get('Origin') !== url.origin) return new Response('Forbidden', { status: 403 });
  const form = await request.formData();
  const env = cloudflareEnv;
  const email = normalizeEmail(String(form.get('email') ?? ''));
  // Single access point: the email address decides the role (and later the
  // destination area); the form cannot choose it.
  const user = await env.DB.prepare('SELECT role FROM users WHERE email = ?1 AND active = 1 LIMIT 1')
    .bind(email).first<{ role: 'admin' | 'client' }>();
  const role: 'admin' | 'client' = user?.role === 'admin' ? 'admin' : 'client';
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  let preview = '';
  let challengeCookie = randomId();

  const issued = await requestOtp(env.DB, env, email, role, ip);
  if (issued.challengeId && issued.code && issued.recipient) {
    try {
      // Dev-only code reveal for local testing without email delivery. The
      // import.meta.env.DEV check must stay in this condition: it is replaced with
      // `false` at build time, so production builds strip this entire branch (no code
      // logging, no preview param) and always take the real email path below.
      if (import.meta.env.DEV && isDevelopment(env, url)) {
        console.log(`[dev] login code for ${issued.recipient}: ${issued.code}`);
        if (env.DEV_OTP_PREVIEW === 'true') preview = issued.code;
      } else {
        await sendOtpEmail(env, issued.recipient, issued.code);
      }
      challengeCookie = issued.challengeId;
    } catch (error) {
      console.error('OTP email delivery failed', error instanceof Error ? error.message : 'Unknown email service error');
      await env.DB.prepare('DELETE FROM otp_challenges WHERE id = ?1').bind(issued.challengeId).run();
    }
  }
  cookies.set(CHALLENGE_COOKIE, challengeCookie, {
    httpOnly: true,
    secure: !isDevelopment(env, url),
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60,
  });

  const params = new URLSearchParams({ sent: '1' });
  if (preview) params.set('preview', preview);
  return redirect(`/portal/login?${params}`, 303);
};
