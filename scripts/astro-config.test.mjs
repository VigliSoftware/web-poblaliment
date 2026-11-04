import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

const configUrl = new URL('../astro.config.mjs', import.meta.url).href;

/**
 * @param {import('node:test').TestContext} t
 * @param {string} [fileValue]
 * @param {string} [environmentValue]
 */
function readSite(t, fileValue, environmentValue) {
  const cwd = mkdtempSync(join(tmpdir(), 'astro-config-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  if (fileValue !== undefined) {
    writeFileSync(join(cwd, '.env'), `PUBLIC_SITE_URL="${fileValue}"\n`);
  }
  const env = { ...process.env };
  delete env.PUBLIC_SITE_URL;
  if (environmentValue !== undefined) env.PUBLIC_SITE_URL = environmentValue;
  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import config from ${JSON.stringify(configUrl)}; console.log(config.site);`,
    ],
    { cwd, env, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

test('Astro reads the public site URL from .env during configuration', (t) => {
  assert.equal(readSite(t, 'https://poblaliment.com'), 'https://poblaliment.com');
});

test('the build environment takes precedence over the .env site URL', (t) => {
  assert.equal(
    readSite(t, 'https://poblaliment.com', 'https://build.example.org'),
    'https://build.example.org',
  );
});

test('the production site is the default without .env or a public site URL', (t) => {
  assert.equal(readSite(t), 'https://poblaliment.com');
});

test('an empty public site URL falls back to the production site', (t) => {
  assert.equal(readSite(t, undefined, ''), 'https://poblaliment.com');
  assert.equal(readSite(t, undefined, '   '), 'https://poblaliment.com');
});
