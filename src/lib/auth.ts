import type { AstroCookies } from 'astro';
import { env } from 'cloudflare:workers';

// Stateless admin sessions: the cookie holds `username.expiry.signature`, signed with
// HMAC-SHA256 using SESSION_SECRET.

export const sessionCookie = 'poblaliment_admin';
const sessionSeconds = 60 * 60 * 12;
const encoder = new TextEncoder();

async function signingKey(): Promise<CryptoKey> {
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must be set to at least 32 characters');
  }
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(env.SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');

const fromBase64Url = (value: string) =>
  Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), (char) =>
    char.charCodeAt(0),
  );

export async function startSession(cookies: AstroCookies, username: string) {
  const expires = Math.floor(Date.now() / 1000) + sessionSeconds;
  const payload = `${toBase64Url(encoder.encode(username))}.${expires}`;
  const signature = await crypto.subtle.sign('HMAC', await signingKey(), encoder.encode(payload));

  cookies.set(sessionCookie, `${payload}.${toBase64Url(new Uint8Array(signature))}`, {
    path: '/admin',
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: sessionSeconds,
  });
}

export function endSession(cookies: AstroCookies) {
  cookies.delete(sessionCookie, { path: '/admin' });
}

export async function readSession(cookies: AstroCookies): Promise<string | undefined> {
  const token = cookies.get(sessionCookie)?.value;
  const [user, expires, signature] = token?.split('.') ?? [];
  if (!user || !expires || !signature) return undefined;
  if (Number(expires) < Date.now() / 1000) return undefined;

  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await signingKey(),
      fromBase64Url(signature),
      encoder.encode(`${user}.${expires}`),
    );
    return valid ? new TextDecoder().decode(fromBase64Url(user)) : undefined;
  } catch {
    return undefined;
  }
}
