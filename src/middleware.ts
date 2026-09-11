import { env as cloudflareEnv } from 'cloudflare:workers';
import { defineMiddleware } from 'astro:middleware';
import { getPrincipal, sessionCookieName } from '@/lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.principal = null;
  const name = sessionCookieName(cloudflareEnv, context.url);
  context.locals.principal = await getPrincipal(cloudflareEnv.DB, context.cookies.get(name)?.value);
  const response = await next();
  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'");
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  if (context.url.pathname.startsWith('/portal') || context.url.pathname.startsWith('/admin') || context.url.pathname.startsWith('/api') || context.url.pathname.startsWith('/documents')) {
    headers.set('Cache-Control', 'private, no-store');
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
