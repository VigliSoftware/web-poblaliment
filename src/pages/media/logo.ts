import type { APIRoute } from 'astro';
import { getObject } from '../../lib/storage';

// Serves /media/logo/?k=logos/<file>. A query string keeps the URL valid with trailingSlash.
export const GET: APIRoute = async ({ url }) => {
  const key = url.searchParams.get('k') ?? '';
  if (!/^logos\/[\w-]+\.(png|jpg|webp|svg)$/.test(key)) return new Response(null, { status: 404 });

  const object = await getObject(key);
  if (!object) return new Response(null, { status: 404 });

  return new Response(object.body, {
    headers: {
      'Content-Type': object.headers.get('Content-Type') ?? 'application/octet-stream',
      // Keys change on every upload, so the response never goes stale.
      'Cache-Control': 'public, max-age=31536000, immutable',
      // Uploaded SVGs must not be able to run scripts on this origin.
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
