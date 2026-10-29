import type { APIRoute } from 'astro';
import { getObject } from '../../lib/storage';

export const GET: APIRoute = async ({ url }) => {
  const key = url.searchParams.get('k') ?? '';
  if (!/^pages\/[\w-]+\.(png|jpg|webp|avif|svg)$/.test(key))
    return new Response(null, { status: 404 });
  const object = await getObject(key);
  if (!object) return new Response(null, { status: 404 });
  return new Response(object.body, {
    headers: {
      'Content-Type': object.headers.get('Content-Type') ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
