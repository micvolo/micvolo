import { defineMiddleware } from 'astro:middleware';
import { verifySession } from '@/lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith('/project/')) {
    return next();
  }

  // /project/[slug] or /project/[slug]/login or /project/[slug]/...
  const parts = pathname.replace(/\/$/, '').split('/').filter(Boolean);
  // parts[0] = 'project', parts[1] = slug, parts[2] = sub-page (optional)
  const slug = parts[1];

  if (!slug) return next();

  // Login page is always accessible
  if (parts[2] === 'login') return next();

  const sessionCookie = context.cookies.get(`session_${slug}`)?.value;

  if (!sessionCookie) {
    return context.redirect(`/project/${slug}/login`);
  }

  const secret = context.locals.runtime.env.COOKIE_SECRET;
  const valid = await verifySession(sessionCookie, slug, secret);

  if (!valid) {
    context.cookies.delete(`session_${slug}`, { path: `/project/${slug}` });
    return context.redirect(`/project/${slug}/login`);
  }

  return next();
});
