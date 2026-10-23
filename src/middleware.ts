import type { APIContext, MiddlewareNext } from 'astro';
import { defineMiddleware } from 'astro:middleware';
import { readSession } from './lib/auth';
import { defaultSiteData, getSiteData } from './lib/site-data';

// public/_headers only covers static assets, so on-demand pages get the same headers here.
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Frame-Options': 'SAMEORIGIN',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await handle(context, next);
  if (!context.isPrerendered) {
    for (const [name, value] of Object.entries(securityHeaders)) {
      if (!response.headers.has(name)) response.headers.set(name, value);
    }
  }
  return response;
});

async function handle(context: APIContext, next: MiddlewareNext): Promise<Response> {
  const { pathname } = context.url;

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    context.locals.adminUser = await readSession(context.cookies);
    const isLogin = pathname.startsWith('/admin/login');
    if (!context.locals.adminUser && !isLogin) return context.redirect('/admin/login/');

    const response = await next();
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  context.locals.site = context.isPrerendered ? defaultSiteData : await getSiteData();
  return next();
}
