import type { SiteCopy } from '../data/content.ts';
import { getPageImage, type PageImage, type PageImages } from '../data/page-images.ts';
import type { Locale } from './i18n.ts';

export type NoveltyCopy = SiteCopy['cellar']['noveltyTamaral'];
export type Novelty = {
  id: string;
  section: 'food' | 'cellar';
  active: boolean;
  order: number;
  image: PageImage;
  copy: Record<Locale, NoveltyCopy>;
};
export const defaultCellarHeading = {
  ca: { kicker: 'Novetats', title: 'Productes destacats del celler.' },
  es: { kicker: 'Novedades', title: 'Productos destacados de la bodega.' },
};

export type Novelties = {
  items: Novelty[];
  heading: Record<Locale, { title: string; kicker: string }>;
  cellarHeading: Record<Locale, { title: string; kicker: string }>;
};
export class NoveltyError extends Error {}

// Read the previous CMS values once during migration, including uploaded photos.
export function legacyNovelties(content: Record<Locale, SiteCopy>, images: PageImages): Novelties {
  return {
    cellarHeading: structuredClone(defaultCellarHeading),
    heading: {
      ca: { title: content.ca.food.noveltiesTitle, kicker: content.ca.food.noveltiesKicker },
      es: { title: content.es.food.noveltiesTitle, kicker: content.es.food.noveltiesKicker },
    },
    items: [
      {
        id: 'imperfect',
        section: 'food',
        order: 10,
        active: true,
        image: getPageImage(images, 'foodNoveltyImperfect'),
        copy: { ca: content.ca.food.noveltyImperfect, es: content.es.food.noveltyImperfect },
      },
      {
        id: 'frime',
        section: 'food',
        order: 20,
        active: true,
        image: getPageImage(images, 'foodNoveltyFrime'),
        copy: { ca: content.ca.food.noveltyFrime, es: content.es.food.noveltyFrime },
      },
      {
        id: 'tamaral',
        section: 'cellar',
        order: 10,
        active: true,
        image: getPageImage(images, 'cellarNoveltyTamaral'),
        copy: { ca: content.ca.cellar.noveltyTamaral, es: content.es.cellar.noveltyTamaral },
      },
    ],
  };
}

export function visibleNovelties(data: Novelties, section: Novelty['section']) {
  return data.items
    .filter((item) => item.active && item.section === section)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

export function readNovelty(form: FormData, id: string, image: PageImage): Novelty {
  const text = (name: string) => String(form.get(name) ?? '').trim();
  const section = text('section');
  if (section !== 'food' && section !== 'cellar')
    throw new NoveltyError('Tria Alimentació o Celler.');
  const order = Number(text('order'));
  if (!Number.isSafeInteger(order) || order < 0 || order > 100000)
    throw new NoveltyError('L’ordre ha de ser un enter entre 0 i 100.000.');
  const copy = {} as Record<Locale, NoveltyCopy>;
  for (const locale of ['ca', 'es'] as const) {
    const entry = Object.fromEntries(
      ['kicker', 'title', 'body', 'link', 'href', 'imageAlt'].map((key) => [
        key,
        text(`${locale}|${key}`),
      ]),
    ) as NoveltyCopy;
    if (!entry.title || !entry.body || !entry.imageAlt)
      throw new NoveltyError(
        `Omple el títol, el text i el text alternatiu (${locale.toUpperCase()}).`,
      );
    if (Object.values(entry).some((value) => value.length > 10000))
      throw new NoveltyError('Els textos no poden superar 10.000 caràcters.');
    if (entry.href) {
      let url: URL;
      try {
        url = new URL(entry.href);
      } catch {
        throw new NoveltyError('L’enllaç ha de ser una URL completa.');
      }
      if (!['https:', 'http:'].includes(url.protocol))
        throw new NoveltyError('L’enllaç ha de començar per https:// o http://.');
      if (!entry.link)
        throw new NoveltyError(`Omple el text de l’enllaç (${locale.toUpperCase()}).`);
    }
    copy[locale] = entry;
  }
  return { id, section, order, active: form.has('active'), image, copy };
}

export function replaceNovelty(data: Novelties, item: Novelty): Novelties {
  return { ...data, items: [...data.items.filter((previous) => previous.id !== item.id), item] };
}

// Existing catalogues predate the cellar heading; resolve it without replacing saved content.
export function noveltyHeading(
  data: Pick<Novelties, 'heading'> & Partial<Pick<Novelties, 'cellarHeading'>>,
  section: Novelty['section'],
  locale: Locale,
) {
  return section === 'food'
    ? data.heading[locale]
    : (data.cellarHeading ?? defaultCellarHeading)[locale];
}
