import type { SupplierCategory } from '../data/suppliers';
import { requireSql } from './db';
import { faviconFor, invalidateSiteData, supplierLogo } from './site-data';
import { deleteObject, logoTypes, maxLogoBytes, putObject } from './storage';

export const sectionNames: Record<SupplierCategory['section'], string> = {
  food: 'Aliments',
  cellar: 'Celler',
  beer: 'Cervesa (destacat del Celler)',
};

export type AdminCategory = {
  id: number;
  name_ca: string;
  name_es: string;
  section: SupplierCategory['section'];
  sort_order: number;
  supplier_count: number;
};

export type AdminSupplier = {
  id: number;
  name: string;
  category_id: number;
  website: string | null;
  featured: boolean;
  featured_order: number;
  sort_order: number;
  logo_key: string | null;
  logo_url: string | null;
};

export class FormError extends Error {}

export const text = (form: FormData, name: string) => String(form.get(name) ?? '').trim();

export function integer(form: FormData, name: string, fallback = 0) {
  const value = Number.parseInt(text(form, name), 10);
  return Number.isFinite(value) ? value : fallback;
}

export function websiteOrNull(value: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
  } catch {}
  throw new FormError('La web ha de ser una adreça completa, per exemple https://exemple.com/');
}

// What the public site shows: the uploaded logo, or else the website's icon.
export const logoSrc = (supplier: Pick<AdminSupplier, 'logo_key' | 'logo_url' | 'website'>) =>
  supplierLogo(supplier) ?? faviconFor(supplier.website);

export const hasOwnLogo = (supplier: Pick<AdminSupplier, 'logo_key' | 'logo_url'>) =>
  Boolean(supplierLogo(supplier));

export async function listCategories(): Promise<AdminCategory[]> {
  const sql = requireSql();
  return (await sql`
    SELECT c.id, c.name_ca, c.name_es, c.section, c.sort_order, count(s.id)::int AS supplier_count
    FROM categories c LEFT JOIN suppliers s ON s.category_id = c.id
    GROUP BY c.id ORDER BY c.sort_order, c.id`) as AdminCategory[];
}

export async function listSuppliers(): Promise<AdminSupplier[]> {
  const sql = requireSql();
  return (await sql`
    SELECT s.id, s.name, s.category_id, s.website, s.featured, s.featured_order, s.sort_order,
      s.logo_key, s.logo_url
    FROM suppliers s JOIN categories c ON c.id = s.category_id
    ORDER BY c.sort_order, c.id, s.sort_order, s.name`) as AdminSupplier[];
}

export function validateLogo(file: File): string {
  const extension = logoTypes[file.type];
  if (!extension) throw new FormError('El logo ha de ser PNG, JPG, WebP o SVG.');
  if (file.size > maxLogoBytes) throw new FormError('El logo no pot superar 1 MB.');
  return extension;
}

// Stores an uploaded logo under a fresh key and returns it. Old objects are removed by the caller.
export async function uploadLogo(file: File, supplierId: number): Promise<string> {
  const extension = validateLogo(file);
  const key = `logos/${supplierId}-${Date.now().toString(36)}.${extension}`;
  await putObject(key, await file.arrayBuffer(), file.type);
  return key;
}

export async function removeLogoObject(key: string | null) {
  if (!key) return;
  try {
    await deleteObject(key);
  } catch (error) {
    console.error(`Could not delete logo ${key}`, error);
  }
}

export function published() {
  invalidateSiteData();
}

export const errorMessage = (error: unknown) =>
  error instanceof FormError
    ? error.message
    : 'No s’ha pogut desar. Torna-ho a provar d’aquí a uns segons.';
