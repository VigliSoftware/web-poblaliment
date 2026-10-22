import assert from 'node:assert/strict';

const value = process.env.PUBLIC_SITE_URL;

assert.ok(value, 'PUBLIC_SITE_URL must be set before deploying.');

const url = new URL(value);
const forbiddenHosts = new Set(['localhost', '127.0.0.1', '::1', 'example.com', 'www.example.com']);

assert.equal(url.protocol, 'https:', 'PUBLIC_SITE_URL must use HTTPS.');
assert.ok(
  !forbiddenHosts.has(url.hostname),
  'PUBLIC_SITE_URL cannot use localhost or example.com.',
);
assert.ok(
  !url.hostname.endsWith('.example'),
  'PUBLIC_SITE_URL cannot use a reserved .example domain.',
);

console.log(`Production URL verified: ${url.origin}`);
