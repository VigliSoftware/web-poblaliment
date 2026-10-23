import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist');
const pages = [
  ['index.html', 'https://www.example.com/'],
  ['es/index.html', 'https://www.example.com/es/'],
  ['nosaltres/index.html', 'https://www.example.com/nosaltres/'],
  ['es/nosotros/index.html', 'https://www.example.com/es/nosotros/'],
  ['aliments/index.html', 'https://www.example.com/aliments/'],
  ['celler/index.html', 'https://www.example.com/celler/'],
  ['es/alimentos/index.html', 'https://www.example.com/es/alimentos/'],
  ['es/bodega/index.html', 'https://www.example.com/es/bodega/'],
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
  assert.doesNotMatch(html, /<video[^>]*poster=/);
  assert.match(html, /data-hero-content/);
  assert.match(html, /data-hero-animate/);
  assert.match(html, /service-row grid gap-4/);
  assert.doesNotMatch(html, /service-row--blue/);
  assert.doesNotMatch(html, /text-3xl font-semibold sm:text-4xl/);
  assert.match(html, /featured-suppliers/);
  assert.match(html, /TGT/);
  assert.match(html, /Friolisa/);
  assert.match(html, /Moritz/);
  assert.match(html, /\/images\/moritz-mark-transparent\.png/);
  assert.match(html, /catalog-links/);
  assert.doesNotMatch(html, /01 \/ 04/);
}

assert.match(readFileSync(resolve(dist, 'index.html'), 'utf8'), /mobile-nav flex justify-center/);

const homeCa = readFileSync(resolve(dist, 'index.html'), 'utf8');
const homeEs = readFileSync(resolve(dist, 'es/index.html'), 'utf8');
assert.match(homeCa, /Consultar Aliments/);
assert.match(homeCa, /Consultar Celler/);
assert.match(homeEs, /Consultar Alimentos/);
assert.match(homeEs, /Consultar Bodega/);

assert.ok(existsSync(resolve(dist, 'HeroVideo.mp4')));
assert.ok(existsSync(resolve(dist, 'images/moritz-mark-transparent.png')));

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
assert.match(aboutCa, /src="\/images\/products-ubla\.jpeg"/);
assert.match(aboutCa, /anniversary-image overflow-hidden sm:-mt-6/);
assert.match(aboutCa, /max-w-3xl sm:pb-36/);
assert.match(aboutEs, /abril de 1999/);
assert.match(aboutEs, /PIGAL/);
assert.match(aboutEs, /src="\/images\/about-route\.jpeg"/);
assert.match(aboutEs, /src="\/images\/products-ubla\.jpeg"/);
assert.match(aboutEs, /anniversary-image overflow-hidden sm:-mt-6/);
assert.match(aboutEs, /max-w-3xl sm:pb-36/);

for (const page of [
  'aliments/index.html',
  'celler/index.html',
  'es/alimentos/index.html',
  'es/bodega/index.html',
]) {
  assert.match(readFileSync(resolve(dist, page), 'utf8'), /max-w-3xl sm:pb-36/);
}

for (const page of ['contacte/index.html', 'es/contacto/index.html']) {
  const html = readFileSync(resolve(dist, page), 'utf8');
  assert.match(html, /mailto:info@poblaliment\.com/);
  assert.match(html, /tel:\+34973680341/);
  assert.match(html, /instagram\.com\/poblaliment/);
  assert.match(html, /<body class="contact-page">/);
  assert.doesNotMatch(html, /page-intro/);
}

const foodCa = readFileSync(resolve(dist, 'aliments/index.html'), 'utf8');
const foodEs = readFileSync(resolve(dist, 'es/alimentos/index.html'), 'utf8');
assert.match(foodCa, /Aliments per a cada servei/);
assert.match(foodCa, /food-supplier-grid/);
assert.doesNotMatch(foodCa, /data-auto-rail/);
assert.match(foodCa, /href="#food-filter"/);
assert.match(foodCa, /id="food-filter"/);
assert.match(foodCa, /Descobreix els aliments/);
assert.match(foodCa, /food-scroll-cue-spacing/);
assert.doesNotMatch(foodCa, />Moritz</);
assert.match(foodEs, /Alimentos para cada servicio/);
assert.match(foodEs, /food-supplier-grid/);
assert.doesNotMatch(foodEs, /data-auto-rail/);
assert.match(foodEs, /href="#food-filter"/);
assert.match(foodEs, /id="food-filter"/);
assert.match(foodEs, /Descubre los alimentos/);
assert.match(foodEs, /food-scroll-cue-spacing/);

const cellarCa = readFileSync(resolve(dist, 'celler/index.html'), 'utf8');
const cellarEs = readFileSync(resolve(dist, 'es/bodega/index.html'), 'utf8');
assert.match(cellarCa, /Vins i escumosos/);
assert.match(cellarCa, />La nostra cervesa\.<\/h2>/);
assert.match(cellarCa, /moritz\/ca_ES\/images\/logo\.svg/);
assert.match(cellarCa, /cellar-scroll-cue/);
assert.match(cellarCa, /cellar-hero-stage/);
assert.match(cellarCa, /data-cellar-heading/);
assert.match(cellarCa, /data-cellar-copy/);
assert.match(cellarCa, /is-hidden-on-return/);
assert.match(cellarEs, /Vinos y espumosos/);
assert.match(cellarEs, />Nuestra cerveza\.<\/h2>/);
assert.match(cellarEs, /moritz\/ca_ES\/images\/logo\.svg/);
assert.match(cellarEs, /cellar-scroll-cue/);
assert.match(cellarEs, /cellar-hero-stage/);
assert.match(cellarEs, /data-cellar-copy/);

const globalCss = readFileSync(resolve('src/styles/global.css'), 'utf8');
assert.doesNotMatch(globalCss, /\.signal-band::after/);
assert.match(globalCss, /\.beer-feature\s*{[^}]*padding-block:/s);
assert.match(
  globalCss,
  /\.beer-feature-copy\s*>\s*a\s*{[^}]*border-bottom:\s*2px solid var\(--color-orange\)/s,
);
assert.match(globalCss, /\.food-scroll-cue-spacing\s*{[^}]*padding-bottom:/s);
assert.match(
  globalCss,
  /\.featured-supplier \.supplier-mark--transparent\s*{[^}]*background:\s*#fff/s,
);
assert.match(globalCss, /@keyframes cellar-scroll-pulse/);

assert.ok(!existsSync(resolve(dist, 'marques/index.html')));
assert.ok(!existsSync(resolve(dist, 'es/marcas/index.html')));

for (const page of ['legal/index.html', 'es/legal/index.html']) {
  const html = readFileSync(resolve(dist, page), 'utf8');
  assert.match(html, /id="avis-legal"/);
  assert.match(html, /id="privacitat"/);
  assert.match(html, /id="cookies"/);
  assert.match(html, /B25433939/);
}

console.log('Static site metadata, robots.txt, sitemap, and 404 output verified.');
