import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// Astro does not load .env before evaluating this configuration.
// Existing environment variables (for example, from Cloudflare Builds) take precedence.
if (existsSync('.env')) loadEnvFile('.env');
const site = process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321';

// Pages render on demand so copy and suppliers edited in /admin show up without a rebuild.
export default defineConfig({
  output: 'server',
  adapter: cloudflare({ imageService: 'passthrough' }),
  // Admin sessions use a signed cookie, so Astro's KV-backed sessions are not needed.
  session: false,
  site,
  trailingSlash: 'always',
  integrations: [
    react(),
    sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/admin') }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
