// Creates an admin user, or resets the password of an existing one.
//
//   pnpm admin:create <username> <password>
import { neon } from '@neondatabase/serverless';
import { hashPassword } from '../src/lib/password.ts';

const [username, password] = process.argv.slice(2);
if (!username || !password) throw new Error('Usage: pnpm admin:create <username> <password>');
if (password.length < 10) throw new Error('Use a password of at least 10 characters');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Set DATABASE_URL in .env');

const sql = neon(databaseUrl);
await sql`
  INSERT INTO admin_users (username, password_hash)
  VALUES (${username}, ${await hashPassword(password)})
  ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`;

console.log(`Admin user "${username}" is ready.`);
