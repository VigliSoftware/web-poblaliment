import type { APIRoute } from 'astro';
export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const siteUrl = new URL('/sitemap-index.xml', site ?? 'http://localhost:4321').href;

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
