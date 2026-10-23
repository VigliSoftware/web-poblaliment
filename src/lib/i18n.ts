export const locales = ['ca', 'es'] as const;

export type Locale = (typeof locales)[number];
export type PageKey = 'home' | 'food' | 'cellar' | 'about' | 'contact' | 'legal';

export const pagePaths: Record<Locale, Record<PageKey, string>> = {
  ca: {
    home: '/',
    about: '/nosaltres/',
    food: '/aliments/',
    cellar: '/celler/',
    contact: '/contacte/',
    legal: '/legal/',
  },
  es: {
    home: '/es/',
    about: '/es/nosotros/',
    food: '/es/alimentos/',
    cellar: '/es/bodega/',
    contact: '/es/contacto/',
    legal: '/es/legal/',
  },
};

export function getLocaleFromPath(pathname: string): Locale {
  return pathname === '/es' || pathname.startsWith('/es/') ? 'es' : 'ca';
}

export function localizedPath(locale: Locale, page: PageKey): string {
  return pagePaths[locale][page];
}

export function getPageFromPath(pathname: string): PageKey {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;

  for (const locale of locales) {
    for (const page of Object.keys(pagePaths[locale]) as PageKey[]) {
      const pagePath = localizedPath(locale, page);
      const normalizedPagePath = pagePath.length > 1 ? pagePath.replace(/\/$/, '') : pagePath;

      if (normalizedPagePath === normalizedPath) {
        return page;
      }
    }
  }

  return 'home';
}
