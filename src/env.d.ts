/// <reference types="astro/client" />

declare module 'cloudflare:workers' {
  // Worker variables and secrets (`.dev.vars` locally, `wrangler secret put` in production).
  export const env: {
    DATABASE_URL?: string;
    SESSION_SECRET?: string;
    S3_ENDPOINT?: string;
    S3_ACCESS_KEY_ID?: string;
    S3_SECRET_ACCESS_KEY?: string;
    S3_REGION?: string;
    S3_BUCKET?: string;
  };
}

declare namespace App {
  interface Locals {
    site: import('./lib/site-data').SiteData;
    adminUser?: string;
  }
}
