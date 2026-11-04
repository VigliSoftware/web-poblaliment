import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
import { imageSize } from 'image-size';
import manifest from '../src/data/optimized-media.json' with { type: 'json' };
import { faviconForLogo, imageSrcset } from '../src/lib/optimized-media.ts';
import { imageDimensions } from '../src/lib/images.ts';
/** @type {Record<string, { width: number, height: number, variants: Array<{src: string, width: number, bytes: number}> }>} */
const images = manifest.images;

test('responsive WebP variants exist, preserve aspect ratio and never upscale originals', () => {
  for (const [original, image] of Object.entries(images)) {
    let lastWidth = 0;
    assert.ok(imageSrcset(original));
    for (const variant of image.variants) {
      const bytes = readFileSync(`public${variant.src}`);
      const size = imageSize(bytes);
      assert.equal(size.type, 'webp', variant.src);
      assert.equal(size.width, variant.width, variant.src);
      assert.ok(variant.width > lastWidth && variant.width <= image.width, variant.src);
      assert.ok(
        Math.abs(size.height - (image.height * variant.width) / image.width) <= 1,
        variant.src,
      );
      assert.equal(bytes.length, variant.bytes, variant.src);
      lastWidth = variant.width;
    }
    if (imageDimensions[original] && original !== '/images/logo.jpg') {
      assert.equal(
        lastWidth,
        Math.min(image.width, 1600),
        `${original}: keep adequate photo resolution`,
      );
    }
  }
});

test('the gallery, Moritz mark and header logo have bounded delivery sizes', () => {
  for (const source of [
    '/images/truck-sunset.jpg',
    '/images/truck-snow.jpg',
    '/images/oficina_poblaliment.jpeg',
  ]) {
    const largest = images[source].variants.at(-1);
    assert.ok(largest);
    assert.ok(largest.bytes < 300_000, source);
    assert.ok(largest.bytes < statSync(`public${source}`).size, source);
  }
  for (const source of ['/images/moritz-mark-transparent.png', '/images/logo.jpg']) {
    const thumbnail = images[source].variants.find((variant) => variant.width >= 96);
    assert.ok(thumbnail);
    assert.ok(thumbnail.bytes < 10_000, source);
  }
});

test('favicon uses the same logo in a small PNG and CMS logos remain supported', () => {
  const favicon = faviconForLogo({ src: '/images/logo.jpg', type: 'image/jpeg' });
  const bytes = readFileSync(`public${favicon.src}`);
  const size = imageSize(bytes);
  assert.deepEqual([size.width, size.height, size.type], [96, 96, 'png']);
  assert.ok(bytes.length < 15_000);
  const replacement = { src: '/media/image/?k=pages%2Fnew-logo.svg', type: 'image/svg+xml' };
  assert.equal(faviconForLogo(replacement).src, replacement.src);
  assert.equal(imageSrcset(replacement.src), undefined);
  assert.equal(imageSrcset('https://example.org/photo.jpg'), undefined);
});

test('video delivery versions and poster are smaller than the original', () => {
  const originalSize = statSync('public/HeroVideo.mp4').size;
  for (const [name, src] of Object.entries(manifest.video)) {
    const size = statSync(`public${src}`).size;
    assert.ok(size > 0 && size < originalSize / 2, name);
  }
  assert.ok(statSync(`public${manifest.video.poster}`).size < 100_000);
});
