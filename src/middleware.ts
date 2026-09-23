import { env as cloudflareEnv } from 'cloudflare:workers';
import { defineMiddleware } from 'astro:middleware';
import { getPrincipal, sessionCookieName } from '@/lib/auth';

// Only the on-demand routes need runtime work: auth state for /admin, /portal,
// /api and /documents, plus security headers on their SSR responses. The
// prerendered majority is served straight from static assets in deployment and
// never reaches this middleware; its headers live in public/_headers.
const DYNAMIC_PREFIXES = ['/portal', '/admin', '/api', '/documents'];

export const onRequest = defineMiddleware(async (context, next) => {
  if (!DYNAMIC_PREFIXES.some((prefix) => context.url.pathname.startsWith(prefix))) return next();
  const name = sessionCookieName(cloudflareEnv, context.url);
  context.locals.principal = await getPrincipal(cloudflareEnv.DB, context.cookies.get(name)?.value);
  const response = await next();
  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'");
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Cache-Control', 'private, no-store');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
