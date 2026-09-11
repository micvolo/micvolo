import { env as cloudflareEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { CHALLENGE_COOKIE, isDevelopment, randomId, requestOtp } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, cookies, redirect, url }) => {
  if (request.headers.get('Origin') !== url.origin) return new Response('Forbidden', { status: 403 });
  const form = await request.formData();
  const email = String(form.get('email') ?? '');
  const role = form.get('role') === 'admin' ? 'admin' : 'client';
  const env = cloudflareEnv;
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  let preview = '';
  let challengeCookie = randomId();

  const issued = await requestOtp(env.DB, env, email, role, ip);
  if (issued.challengeId && issued.code && issued.recipient) {
    const devPreview = env.DEV_OTP_PREVIEW === 'true' && isDevelopment(env, url);
    try {
      if (devPreview) preview = issued.code;
      else await sendOtpEmail(env, issued.recipient, issued.code);
      challengeCookie = issued.challengeId;
    } catch {
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

  const target = role === 'admin' ? '/admin/login' : '/portal/login';
  const params = new URLSearchParams({ sent: '1' });
  if (preview) params.set('preview', preview);
  return redirect(`${target}?${params}`, 303);
};
