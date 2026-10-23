import { content as defaultContent, type SiteCopy } from '../data/content';
import {
  defaultCategories,
  defaultSuppliers,
  type CategorySection,
  type Supplier,
  type SupplierCategory,
} from '../data/suppliers';
import { mergeCopy } from './content-fields';
import { getSql } from './db';
import type { Locale } from './i18n';

export type SiteData = {
  content: Record<Locale, SiteCopy>;
  categories: SupplierCategory[];
  // Ordered by category, then by the order set in the admin panel.
  suppliers: Supplier[];
  // Home page brands, in display order.
  featured: Supplier[];
};

type CategoryRow = { id: number; name_ca: string; name_es: string; section: CategorySection };
type SupplierRow = {
  id: number;
  name: string;
  category_id: number;
  website: string | null;
  featured: boolean;
  logo_key: string | null;
  logo_url: string | null;
};
type ContentRow = { locale: Locale; data: unknown };

export const defaultSiteData: SiteData = {
  content: defaultContent,
  categories: defaultCategories,
  suppliers: defaultSuppliers,
  featured: defaultSuppliers.filter((supplier) => supplier.featured),
};

export const supplierLogo = (row: Pick<SupplierRow, 'logo_key' | 'logo_url'>) =>
  row.logo_key ? `/media/logo/?k=${encodeURIComponent(row.logo_key)}` : (row.logo_url ?? undefined);

export const faviconFor = (website?: string | null) =>
  website
    ? `https://www.google.com/s2/favicons?domain=${new URL(website).hostname}&sz=128`
    : undefined;

async function loadSiteData(): Promise<SiteData> {
  const sql = getSql();
  if (!sql) return defaultSiteData;

  const [categoryRows, supplierRows, featuredRows, contentRows] = (await sql.transaction(
    [
      sql`SELECT id, name_ca, name_es, section FROM categories ORDER BY sort_order, id`,
      sql`SELECT s.id, s.name, s.category_id, s.website, s.featured, s.logo_key, s.logo_url
          FROM suppliers s JOIN categories c ON c.id = s.category_id
          ORDER BY c.sort_order, c.id, s.sort_order, s.name`,
      sql`SELECT id FROM suppliers WHERE featured ORDER BY featured_order, name`,
      sql`SELECT locale, data FROM site_content`,
    ],
    { readOnly: true },
  )) as [CategoryRow[], SupplierRow[], Array<{ id: number }>, ContentRow[]];

  const storedContent = Object.fromEntries(contentRows.map((row) => [row.locale, row.data]));
  const content = {
    ca: mergeCopy(defaultContent.ca, storedContent.ca),
    es: mergeCopy(defaultContent.es, storedContent.es),
  };

  // Until the catalogue is seeded, keep showing the bundled suppliers.
  if (categoryRows.length === 0) return { ...defaultSiteData, content };

  const suppliers: Supplier[] = supplierRows.map((row) => ({
    id: String(row.id),
    name: row.name,
    categoryId: String(row.category_id),
    website: row.website ?? undefined,
    featured: row.featured,
    logo: supplierLogo(row),
  }));
  const byId = new Map(suppliers.map((supplier) => [supplier.id, supplier]));

  return {
    content,
    categories: categoryRows.map((row) => ({
      id: String(row.id),
      nameCa: row.name_ca,
      nameEs: row.name_es,
      section: row.section,
    })),
    suppliers,
    featured: featuredRows.flatMap((row) => byId.get(String(row.id)) ?? []),
  };
}

// Each Worker isolate keeps the data for a short while so public pages don't hit the
// database on every request. Admin saves clear it for the isolate that handled the save.
const cacheMs = 30_000;
let cached: { data: SiteData; expires: number } | undefined;

export async function getSiteData(): Promise<SiteData> {
  if (cached && cached.expires > Date.now()) return cached.data;

  try {
    const data = await loadSiteData();
    cached = { data, expires: Date.now() + cacheMs };
    return data;
  } catch (error) {
    console.error('Could not load site data, using the last known copy', error);
    return cached?.data ?? defaultSiteData;
  }
}

export function invalidateSiteData() {
  cached = undefined;
}

export const categoryName = (category: SupplierCategory | undefined, locale: Locale) =>
  category ? (locale === 'es' ? category.nameEs : category.nameCa) : '';
