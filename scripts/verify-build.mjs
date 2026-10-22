import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist');
const pages = [
  ['index.html', 'https://www.example.com/'],
  ['es/index.html', 'https://www.example.com/es/'],
  ['nosaltres/index.html', 'https://www.example.com/nosaltres/'],
  ['es/nosotros/index.html', 'https://www.example.com/es/nosotros/'],
  ['marques/index.html', 'https://www.example.com/marques/'],
  ['es/marcas/index.html', 'https://www.example.com/es/marcas/'],
  ['contacte/index.html', 'https://www.example.com/contacte/'],
  ['es/contacto/index.html', 'https://www.example.com/es/contacto/'],
  ['legal/index.html', 'https://www.example.com/legal/'],
  ['es/legal/index.html', 'https://www.example.com/es/legal/'],
];

for (const [page, canonical] of pages) {
  const html = readFileSync(resolve(dist, page), 'utf8');

  assert.match(
    html,
    new RegExp(`<link rel="canonical" href="${canonical.replaceAll('/', '\\/')}"`),
  );
  assert.match(html, /hreflang="ca"/);
  assert.match(html, /hreflang="es"/);
  assert.match(html, /hreflang="x-default"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"LocalBusiness"/);
  assert.match(html, /"PostalAddress"/);
  assert.match(html, /og:image:width/);
  assert.match(html, /href="#main-content"/);
  assert.match(html, /<main id="main-content">/);
  assert.match(html, /data-current-year/);
  assert.match(html, /href="https:\/\/vigli\.dev"/);
  assert.doesNotMatch(html, /web en construcci[oó]/i);
}

for (const page of ['index.html', 'es/index.html']) {
  const html = readFileSync(resolve(dist, page), 'utf8');

  assert.match(html, /<source src="\/HeroVideo\.mp4" type="video\/mp4">/);
  assert.match(html, /<video[^>]*data-hero-video[^>]*muted[^>]*loop[^>]*playsinline/);
  assert.match(html, /poster="\/images\/truck-sunset\.jpg"/);
  assert.match(html, /data-hero-content/);
  assert.match(html, /data-hero-animate/);
  assert.doesNotMatch(html, /01 \/ 04/);
}

assert.ok(existsSync(resolve(dist, 'HeroVideo.mp4')));

const notFound = readFileSync(resolve(dist, '404.html'), 'utf8');
assert.match(notFound, /name="robots" content="noindex, follow"/);

const robots = readFileSync(resolve(dist, 'robots.txt'), 'utf8');
assert.match(robots, /Sitemap: https:\/\/www\.example\.com\/sitemap-index\.xml/);

assert.ok(existsSync(resolve(dist, 'sitemap-index.xml')));
assert.ok(existsSync(resolve(dist, 'sitemap-0.xml')));

const aboutCa = readFileSync(resolve(dist, 'nosaltres/index.html'), 'utf8');
const aboutEs = readFileSync(resolve(dist, 'es/nosotros/index.html'), 'utf8');
assert.match(aboutCa, /abril de 1999/);
assert.match(aboutCa, /PIGAL/);
assert.match(aboutCa, /src="\/images\/about-route\.jpeg"/);
assert.match(aboutCa, /max-w-3xl sm:pb-36/);
assert.match(aboutEs, /abril de 1999/);
assert.match(aboutEs, /PIGAL/);
assert.match(aboutEs, /src="\/images\/about-route\.jpeg"/);
assert.match(aboutEs, /max-w-3xl sm:pb-36/);

for (const page of [
  'marques/index.html',
  'es/marcas/index.html',
  'contacte/index.html',
  'es/contacto/index.html',
]) {
  assert.match(readFileSync(resolve(dist, page), 'utf8'), /max-w-3xl sm:pb-36/);
}

for (const page of ['contacte/index.html', 'es/contacto/index.html']) {
  const html = readFileSync(resolve(dist, page), 'utf8');
  assert.match(html, /mailto:info@poblaliment\.com/);
  assert.match(html, /tel:\+34973680341/);
  assert.match(html, /instagram\.com\/poblaliment/);
}

const brandsCa = readFileSync(resolve(dist, 'marques/index.html'), 'utf8');
const brandsEs = readFileSync(resolve(dist, 'es/marcas/index.html'), 'utf8');
assert.match(brandsCa, /Vins i begudes/);
assert.match(brandsCa, /src="\/images\/products-ubla\.jpeg"/);
assert.match(brandsEs, /Vinos y bebidas/);
assert.match(brandsEs, /src="\/images\/products-ubla\.jpeg"/);

for (const page of ['legal/index.html', 'es/legal/index.html']) {
  const html = readFileSync(resolve(dist, page), 'utf8');
  assert.match(html, /id="avis-legal"/);
  assert.match(html, /id="privacitat"/);
  assert.match(html, /id="cookies"/);
  assert.match(html, /B25433939/);
}

console.log('Static site metadata, robots.txt, sitemap, and 404 output verified.');
