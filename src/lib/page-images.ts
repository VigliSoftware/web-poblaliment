import { isPageImageSlot, type PageImages } from '../data/page-images';
import { requireSql } from './db';

export type PageImageRow = {
  slot: string;
  object_key: string;
  width: number;
  height: number;
  content_type: string;
};
export const pageImageUrl = (key: string) => `/media/image/?k=${encodeURIComponent(key)}`;

export function pageImagesFromRows(rows: PageImageRow[]): PageImages {
  const images: PageImages = {};
  for (const row of rows) {
    if (isPageImageSlot(row.slot)) {
      images[row.slot] = {
        src: pageImageUrl(row.object_key),
        width: row.width,
        height: row.height,
        type: row.content_type,
      };
    }
  }
  return images;
}

export async function listPageImages() {
  const rows =
    await requireSql()`SELECT slot, object_key, width, height, content_type FROM site_images`;
  return pageImagesFromRows(rows as PageImageRow[]);
}
