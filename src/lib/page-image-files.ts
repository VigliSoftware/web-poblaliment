import { imageSize } from 'image-size';

export const maxPageImageBytes = 5 * 1024 * 1024;
export const pageImageAccept = 'image/png,image/jpeg,image/webp,image/avif,image/svg+xml';
const formats: Record<string, { extension: string; detected: string }> = {
  'image/png': { extension: 'png', detected: 'png' },
  'image/jpeg': { extension: 'jpg', detected: 'jpg' },
  'image/webp': { extension: 'webp', detected: 'webp' },
  'image/avif': { extension: 'avif', detected: 'avif' },
  'image/svg+xml': { extension: 'svg', detected: 'svg' },
};

export class PageImageError extends Error {}

export async function readPageImage(file: File) {
  const format = formats[file.type];
  if (!format) throw new PageImageError('La imatge ha de ser PNG, JPG, WebP, AVIF o SVG.');
  if (!file.size) throw new PageImageError('Selecciona una imatge.');
  if (file.size > maxPageImageBytes) throw new PageImageError('La imatge no pot superar 5 MB.');
  const body = await file.arrayBuffer();
  let size: ReturnType<typeof imageSize>;
  try {
    size = imageSize(new Uint8Array(body));
  } catch {
    throw new PageImageError('El fitxer no és una imatge vàlida.');
  }
  if (size.type !== format.detected)
    throw new PageImageError('El format del fitxer no coincideix amb la imatge.');
  const rotated = size.orientation !== undefined && size.orientation >= 5 && size.orientation <= 8;
  const width = rotated ? size.height : size.width;
  const height = rotated ? size.width : size.height;
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width < 1 ||
    height < 1 ||
    width > 16000 ||
    height > 16000 ||
    width * height > 40_000_000
  ) {
    throw new PageImageError(
      'La imatge és massa gran. Redueix-la a un màxim de 40 megapíxels i 16.000 píxels per costat.',
    );
  }
  return { body, width, height, extension: format.extension, type: file.type };
}
