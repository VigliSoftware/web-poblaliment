import manifest from '../data/optimized-media.json' with { type: 'json' };

type ImageVariants = {
  width: number;
  height: number;
  variants: Array<{ src: string; width: number; bytes: number }>;
};
const images: Record<string, ImageVariants> = manifest.images;

// Bundled files and the current CMS snapshot have precomputed variants. New uploads
// and remote URLs retain their delivery path until variants are generated.
export function imageSrcset(src: string): string | undefined {
  return images[src]?.variants.map((variant) => `${variant.src} ${variant.width}w`).join(', ');
}

export function faviconForLogo(logo: { src: string; type: string }) {
  return logo.src === '/images/logo.jpg'
    ? {
        src: manifest.favicon['96'],
        type: 'image/png',
        sizes: '96x96',
        apple: manifest.favicon['180'],
      }
    : { src: logo.src, type: logo.type, sizes: undefined, apple: undefined };
}

export const heroVideo = manifest.video;
