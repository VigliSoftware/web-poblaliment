import { imageDimensions } from '../lib/images.ts';

export const pageImageSlots = {
  siteLogo: { group: 'General', label: 'Logo del web', src: '/images/logo.jpg' },
  homeGalleryMain: {
    group: 'Inici',
    label: 'Galeria · foto gran',
    src: '/images/truck-sunset.jpg',
  },
  homeGallerySecond: {
    group: 'Inici',
    label: 'Galeria · segona foto',
    src: '/images/truck-snow.jpg',
  },
  homeGalleryThird: {
    group: 'Inici',
    label: 'Galeria · tercera foto',
    src: '/images/moritz-pirineus.jpg',
  },
  aboutHero: { group: 'Nosaltres', label: 'Imatge principal', src: '/images/about-dawn.jpeg' },
  aboutAnniversary: {
    group: 'Nosaltres',
    label: 'Aniversari · foto',
    src: '/images/products-ubla.jpeg',
  },
  foodHero: {
    group: 'Alimentació',
    label: 'Imatge principal',
    src: '/images/products-selection.jpeg',
  },
  cellarHero: { group: 'Celler', label: 'Imatge principal', src: '/images/cellar-vineyard.png' },
  cellarBeer: { group: 'Celler', label: 'Destacat · foto', src: '/images/moritz-pirineus.jpg' },
  cellarBeerLogo: {
    group: 'Celler',
    label: 'Destacat · logo',
    src: 'https://moritz.com/static/version1792476927/frontend/Hiberus/moritz/ca_ES/images/logo.svg',
  },
  contactSocial: {
    group: 'Contacte',
    label: 'Imatge per compartir la pàgina',
    src: '/images/contact.jpg',
  },
} as const;

export type PageImageSlot = keyof typeof pageImageSlots;
export type PageImage = { src: string; width: number; height: number; type: string };
export type PageImages = Partial<Record<PageImageSlot, PageImage>>;

export function isPageImageSlot(value: string): value is PageImageSlot {
  return Object.hasOwn(pageImageSlots, value);
}

export function getPageImage(images: PageImages, slot: PageImageSlot): PageImage {
  if (images[slot]) return images[slot];
  const { src } = pageImageSlots[slot];
  const dimensions = slot === 'cellarBeerLogo' ? { width: 544, height: 149 } : imageDimensions[src];
  const type = src.endsWith('.svg')
    ? 'image/svg+xml'
    : src.endsWith('.png')
      ? 'image/png'
      : 'image/jpeg';
  return { src, ...dimensions, type };
}
