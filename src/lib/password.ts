// PBKDF2 password hashing with WebCrypto, shared by the Worker and the Node admin script.
// Cloudflare Workers cap PBKDF2 at 100 000 iterations.

const iterations = 100_000;
const encoder = new TextEncoder();

const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (value: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

async function derive(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  rounds: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: rounds },
    key,
    256,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, iterations);
  return `pbkdf2$${iterations}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, rounds, salt, expected] = stored.split('$');
  if (scheme !== 'pbkdf2' || !rounds || !salt || !expected) return false;

  const actual = await derive(password, fromBase64(salt), Number(rounds));
  const target = fromBase64(expected);
  if (actual.length !== target.length) return false;

  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) {
    difference |= actual[index] ^ target[index];
  }
  return difference === 0;
}
