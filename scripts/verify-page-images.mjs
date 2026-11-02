import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getPageImage, isPageImageSlot, pageImageSlots } from '../src/data/page-images.ts';
import { maxPageImageBytes, PageImageError, readPageImage } from '../src/lib/page-image-files.ts';

for (const slot of Object.keys(pageImageSlots)) {
  assert.ok(isPageImageSlot(slot));
  const original = getPageImage({}, slot);
  assert.ok(original.width > 0 && original.height > 0);
  assert.equal(original.src, pageImageSlots[slot].src);
  const replacement = {
    src: '/media/image/?k=pages%2Fexample.png',
    width: 900,
    height: 600,
    type: 'image/png',
  };
  assert.deepEqual(getPageImage({ [slot]: replacement }, slot), replacement);
}
assert.equal(isPageImageSlot('__proto__'), false);
assert.equal(isPageImageSlot('unknown'), false);

const cellarBeer = getPageImage({}, 'cellarBeer');
const cellarBeerFile = await readPageImage(
  new File([readFileSync(`public${cellarBeer.src}`)], 'moritz.webp', { type: 'image/webp' }),
);
assert.equal(cellarBeer.src, '/images/moritz-selection.webp');
assert.deepEqual(
  [cellarBeer.width, cellarBeer.height],
  [cellarBeerFile.width, cellarBeerFile.height],
);

const photo = await readPageImage(
  new File([readFileSync('public/images/about-dawn.jpeg')], 'photo.jpg', { type: 'image/jpeg' }),
);
assert.deepEqual([photo.width, photo.height, photo.extension], [1206, 1177, 'jpg']);
const svg = await readPageImage(
  new File([readFileSync('public/images/berlys.svg')], 'logo.svg', { type: 'image/svg+xml' }),
);
assert.deepEqual([svg.width, svg.height, svg.extension], [325, 206, 'svg']);
await assert.rejects(
  readPageImage(new File(['hello'], 'file.png', { type: 'image/png' })),
  PageImageError,
);
await assert.rejects(
  readPageImage(new File([], 'empty.jpg', { type: 'image/jpeg' })),
  /Selecciona/,
);
await assert.rejects(readPageImage(new File(['hello'], 'file.txt', { type: 'text/plain' })), /PNG/);
await assert.rejects(
  readPageImage(
    new File([new Uint8Array(maxPageImageBytes + 1)], 'large.png', { type: 'image/png' }),
  ),
  /5 MB/,
);
await assert.rejects(
  readPageImage(
    new File([readFileSync('public/images/berlys.svg')], 'pretend.jpg', { type: 'image/jpeg' }),
  ),
  /format/,
);
await assert.rejects(
  readPageImage(
    new File(['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20000 10000"/>'], 'large.svg', {
      type: 'image/svg+xml',
    }),
  ),
  /massa gran/,
);
console.log('Page image slots, formats, dimensions, upload limits and invalid files verified.');
