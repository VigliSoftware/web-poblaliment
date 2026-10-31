import type { SiteCopy } from '../data/content';

// Helpers that treat the default SiteCopy as the schema for editable text: only string leaves
// that exist in the defaults can be read from the database or written by the admin panel.

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

// Keys that hold routing or asset data rather than copy.
const lockedKeys = new Set(['page', 'src', 'localeLabel', 'otherLocaleLabel']);

export type TextField = { path: string; long: boolean };

export function listTextFields(schema: unknown, prefix = ''): TextField[] {
  if (typeof schema === 'string') return [{ path: prefix, long: schema.length > 90 }];
  if (Array.isArray(schema)) {
    return schema.flatMap((item, index) => listTextFields(item, `${prefix}.${index}`));
  }
  if (schema && typeof schema === 'object') {
    return Object.entries(schema).flatMap(([key, value]) =>
      lockedKeys.has(key) ? [] : listTextFields(value, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [];
}

export function getAtPath(source: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (value, key) =>
        value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined,
      source,
    );
}

export function setAtPath(target: Record<string, Json>, path: string, value: string) {
  const keys = path.split('.');
  let cursor: Json = target;
  for (const key of keys.slice(0, -1)) {
    cursor = (cursor as Record<string, Json>)[key];
    if (!cursor || typeof cursor !== 'object') return;
  }
  (cursor as Record<string, Json>)[keys[keys.length - 1]] = value;
}

// Overlay stored copy on the defaults, keeping the defaults' shape and array lengths.
export function mergeCopy<T>(defaults: T, stored: unknown): T {
  if (typeof defaults === 'string') {
    return (typeof stored === 'string' && stored.trim() ? stored : defaults) as T;
  }
  if (Array.isArray(defaults)) {
    const items = Array.isArray(stored) ? stored : [];
    return defaults.map((item, index) => mergeCopy(item, items[index])) as T;
  }
  if (defaults && typeof defaults === 'object') {
    const record = stored && typeof stored === 'object' ? (stored as Record<string, unknown>) : {};
    return Object.fromEntries(
      Object.entries(defaults).map(([key, value]) => [
        key,
        lockedKeys.has(key) ? value : mergeCopy(value, record[key]),
      ]),
    ) as T;
  }
  return defaults;
}

export const safeHref = (value: string) => /^(https?:\/\/|mailto:|tel:)/i.test(value.trim());

const sectionLabels: Record<string, string> = {
  nav: 'Menú',
  home: 'Inici',
  about: 'Nosaltres',
  food: 'Aliments',
  cellar: 'Celler',
  contact: 'Contacte',
  footer: 'Peu de pàgina',
  legal: 'Legal',
};

const keyLabels: Record<string, string> = {
  title: 'Subtítol',
  description: 'Descripció',
  heading: 'Titular principal',
  intro: 'Introducció',
  imageAlt: 'Text alternatiu (ALT)',
  imageCaption: 'Peu de la imatge',
  primaryAction: 'Botó principal',
  secondaryAction: 'Botó secundari',
  heroNote: 'Nota de la portada',
  signalTitle: 'Franja · títol',
  signalBody: 'Franja · text',
  servicesTitle: 'Serveis · títol',
  services: 'Servei',
  body: 'Text',
  suppliersKicker: 'Marques · avantítol',
  suppliersTitle: 'Marques · títol',
  suppliersBody: 'Marques · text',
  brandsAction: 'Marques · botó de consulta',
  featuredLabel: 'Etiqueta de marca destacada',
  galleryTitle: 'Galeria · títol',
  galleryNote: 'Galeria · nota',
  galleryCaption: 'Galeria · Figcaption',
  gallery: 'Foto de la galeria',
  alt: 'Text alternatiu (ALT)',
  contactTitle: 'Contacte · títol',
  contactBody: 'Contacte · text',
  contactAction: 'Contacte · enllaç',
  historyTitle: 'Història · títol',
  historyParagraphs: 'Història · paràgraf',
  anniversaryKicker: 'Aniversari · avantítol',
  anniversaryTitle: 'Aniversari · títol',
  anniversaryBody: 'Aniversari · text',
  anniversaryImageAlt: 'Aniversari · text alternatiu (ALT)',
  valuesTitle: 'Valors · títol',
  values: 'Valor',
  scrollCue: 'Indicador de desplaçament',
  filterLabel: 'Filtre · etiqueta accessible',
  supplierCount: 'Paraula després del recompte',
  noveltiesKicker: 'Novetats · avantítol',
  noveltiesTitle: 'Novetats · títol de la secció',
  noveltyImperfect: 'Novetat · es im-perfect',
  noveltyFrime: 'Novetat · Frime',
  noveltyTamaral: 'Novetat · Tamaral',
  kicker: 'Avantítol',
  link: 'Text de l’enllaç',
  winesTitle: 'Vins · títol',
  winesBody: 'Vins · text',
  visitLabel: 'Enllaç «visita el celler»',
  beerImageAlt: 'Cervesa · text alternatiu (ALT)',
  beerTitle: 'Cervesa · títol',
  beerBody: 'Cervesa · text',
  beerLink: 'Cervesa · enllaç',
  formTitle: 'Formulari · títol',
  formNote: 'Formulari · nota',
  fields: 'Formulari',
  name: 'Camp nom',
  email: 'Camp correu',
  message: 'Camp missatge',
  submit: 'Botó enviar',
  details: 'Dada de contacte',
  label: 'Etiqueta',
  value: 'Text visible',
  href: 'Enllaç',
  mapTitle: 'Mapa · descripció accessible',
  statement: 'Frase',
  credit: 'Crèdit',
  indexLabel: 'Índex · etiqueta accessible',
  notice: 'Avís legal',
  owner: 'Titular del lloc web',
  contactLabel: 'Etiqueta de contacte',
  contactJoin: 'Separador dels contactes',
  phone: 'Telèfon',
  conditions: 'Condicions d’ús',
  intellectualProperty: 'Propietat intel·lectual',
  privacy: 'Privacitat',
  purposeHeading: 'Finalitat · subtítol',
  purposeBody: 'Finalitat · text',
  retentionHeading: 'Conservació · subtítol',
  retentionBody: 'Conservació · text',
  rightsHeading: 'Drets · subtítol',
  rightsBody: 'Drets · text',
  cookies: 'Cookies',
  usage: 'Ús de cookies',
  externalServices: 'Serveis externs',
  lastUpdated: 'Última actualització',
};

export const editorSections = Object.keys(sectionLabels) as Array<keyof SiteCopy>;

export const sectionLabel = (section: string) => sectionLabels[section] ?? section;

export function fieldLabel(path: string): string {
  if (/^[^.]+\.title$/.test(path)) return 'Títol Google';
  if (/^[^.]+\.description$/.test(path)) return 'Descripció Google';
  const parts = path.split('.').slice(1);
  return parts
    .map((part) => (/^\d+$/.test(part) ? String(Number(part) + 1) : (keyLabels[part] ?? part)))
    .join(' › ');
}
