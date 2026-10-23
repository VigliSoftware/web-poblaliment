import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { env } from 'cloudflare:workers';

let client: NeonQueryFunction<false, false> | undefined;

export function getSql(): NeonQueryFunction<false, false> | undefined {
  if (!env.DATABASE_URL) return undefined;
  client ??= neon(env.DATABASE_URL);
  return client;
}

export function requireSql(): NeonQueryFunction<false, false> {
  const sql = getSql();
  if (!sql) throw new Error('DATABASE_URL is not configured');
  return sql;
}
