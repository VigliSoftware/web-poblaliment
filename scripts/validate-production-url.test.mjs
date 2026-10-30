import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const { scripts } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const [, ...args] = scripts['predeploy:cloudflare'].split(' ');
args[args.length - 1] = fileURLToPath(new URL('./validate-production-url.mjs', import.meta.url));

/**
 * @param {import('node:test').TestContext} t
 * @param {string} [fileValue]
 * @param {string} [environmentValue]
 */
function validate(t, fileValue, environmentValue) {
  const cwd = mkdtempSync(join(tmpdir(), 'production-url-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  if (fileValue !== undefined) {
    writeFileSync(join(cwd, '.env'), `PUBLIC_SITE_URL="${fileValue}"\n`);
  }
  const env = { ...process.env };
  delete env.PUBLIC_SITE_URL;
  if (environmentValue !== undefined) env.PUBLIC_SITE_URL = environmentValue;
  return spawnSync(process.execPath, args, { cwd, env, encoding: 'utf8' });
}

test('predeploy loads the production URL from .env', (t) => {
  const result = validate(t, 'https://poblaliment.cat');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Production URL verified: https:\/\/poblaliment\.cat/);
});

test('predeploy accepts an environment variable without a .env file', (t) => {
  const result = validate(t, undefined, 'https://poblaliment.cat');
  assert.equal(result.status, 0, result.stderr);
});

test('the environment variable takes precedence over .env', (t) => {
  const result = validate(t, 'http://localhost:4321', 'https://poblaliment.cat');
  assert.equal(result.status, 0, result.stderr);
});

test('predeploy still rejects a missing production URL', (t) => {
  const result = validate(t);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /PUBLIC_SITE_URL must be set before deploying/);
});

test('predeploy still rejects an insecure production URL from .env', (t) => {
  const result = validate(t, 'http://poblaliment.cat');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /PUBLIC_SITE_URL must use HTTPS/);
});
