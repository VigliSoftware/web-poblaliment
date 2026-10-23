// Creates the admin tables in Neon and seeds the catalogue from src/data/suppliers.ts the
// first time. Safe to run again: existing rows are left untouched.
//
//   pnpm db:setup
import { neon } from '@neondatabase/serverless';
import { defaultCategories, defaultSuppliers } from '../src/data/suppliers.ts';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Set DATABASE_URL in .env');

const sql = neon(databaseUrl);

await sql`CREATE TABLE IF NOT EXISTS categories (
  id serial PRIMARY KEY,
  name_ca text NOT NULL,
  name_es text NOT NULL,
  section text NOT NULL CHECK (section IN ('food', 'cellar', 'beer')),
  sort_order integer NOT NULL DEFAULT 0
)`;

await sql`CREATE TABLE IF NOT EXISTS suppliers (
  id serial PRIMARY KEY,
  name text NOT NULL,
  category_id integer NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  website text,
  featured boolean NOT NULL DEFAULT false,
  featured_order integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  logo_key text,
  logo_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
)`;

await sql`CREATE TABLE IF NOT EXISTS site_content (
  locale text PRIMARY KEY CHECK (locale IN ('ca', 'es')),
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
)`;

await sql`CREATE TABLE IF NOT EXISTS admin_users (
  id serial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
)`;

const [{ count }] = (await sql`SELECT count(*)::int AS count FROM categories`) as [
  { count: number },
];

if (count > 0) {
  console.log('Tables ready. The catalogue already has data, so it was not seeded again.');
} else {
  const categoryIds = new Map<string, number>();
  for (const [index, category] of defaultCategories.entries()) {
    const [row] = (await sql`
      INSERT INTO categories (name_ca, name_es, section, sort_order)
      VALUES (${category.nameCa}, ${category.nameEs}, ${category.section}, ${(index + 1) * 10})
      RETURNING id`) as [{ id: number }];
    categoryIds.set(category.id, row.id);
  }

  let featuredOrder = 0;
  for (const [index, supplier] of defaultSuppliers.entries()) {
    if (supplier.featured) featuredOrder += 10;
    await sql`
      INSERT INTO suppliers (name, category_id, website, featured, featured_order, sort_order, logo_url)
      VALUES (${supplier.name}, ${categoryIds.get(supplier.categoryId)}, ${supplier.website ?? null},
        ${supplier.featured}, ${supplier.featured ? featuredOrder : 0}, ${(index + 1) * 10},
        ${supplier.logo ?? null})`;
  }

  console.log(
    `Tables ready. Seeded ${defaultCategories.length} categories and ${defaultSuppliers.length} suppliers.`,
  );
}
