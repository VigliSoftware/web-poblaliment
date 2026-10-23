import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Pages render on demand, so they are checked through `astro preview` (workerd). Static
// output (404, robots.txt, sitemap) is read from dist/client. Preview reads .dev.vars, so
// with a database configured the pages show the copy stored there.
const dist = resolve('dist/client');
const port = 4411;
// Astro runs preview as a background server; stop it however the checks end.
/** @param {string[]} args */
const astro = (...args) =>
  spawnSync('pnpm', ['exec', 'astro', 'preview', ...args], { stdio: 'ignore' });
astro('stop');
astro('--background', '--port', String(port));
process.on('exit', () => astro('stop'));

async function waitForPreview() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      await fetch(`http://localhost:${port}/`);
      return;
    } catch {
      await new Promise((done) => setTimeout(done, 500));
    }
  }
  throw new Error('astro preview did not start');
}

/** @param {string} file */
const toPath = (file) => `/${file.replace(/index\.html$/, '')}`;

/** @param {string} file */
async function render(file) {
  if (!file.endsWith('index.html')) return readFileSync(resolve(dist, file), 'utf8');
  const response = await fetch(`http://localhost:${port}${toPath(file)}`);
  assert.equal(response.status, 200, `${toPath(file)} returned ${response.status}`);
  return response.text();
}

/** @param {string} file */
async function exists(file) {
  if (!file.endsWith('index.html')) return existsSync(resolve(dist, file));
  const response = await fetch(`http://localhost:${port}${toPath(file)}`);
  return response.status === 200;
}

await waitForPreview();
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
  const html = await render(page);

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
  const html = await render(page);

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

assert.match(await render('index.html'), /mobile-nav flex justify-center/);

const homeCa = await render('index.html');
const homeEs = await render('es/index.html');
assert.match(homeCa, /Consultar Aliments/);
assert.match(homeCa, /Consultar Celler/);
assert.match(homeEs, /Consultar Alimentos/);
assert.match(homeEs, /Consultar Bodega/);

assert.ok(await exists('HeroVideo.mp4'));
assert.ok(await exists('images/moritz-mark-transparent.png'));

const notFound = await render('404.html');
assert.match(notFound, /name="robots" content="noindex, follow"/);

const robots = await render('robots.txt');
assert.match(robots, /Sitemap: https:\/\/www\.example\.com\/sitemap-index\.xml/);

assert.ok(await exists('sitemap-index.xml'));
assert.ok(await exists('sitemap-0.xml'));

const aboutCa = await render('nosaltres/index.html');
const aboutEs = await render('es/nosotros/index.html');
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
  assert.match(await render(page), /max-w-3xl sm:pb-36/);
}

for (const page of ['contacte/index.html', 'es/contacto/index.html']) {
  const html = await render(page);
  assert.match(html, /mailto:info@poblaliment\.com/);
  assert.match(html, /tel:\+34973680341/);
  assert.match(html, /instagram\.com\/poblaliment/);
  assert.match(html, /<body class="contact-page">/);
  assert.doesNotMatch(html, /page-intro/);
}

const foodCa = await render('aliments/index.html');
const foodEs = await render('es/alimentos/index.html');
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

const cellarCa = await render('celler/index.html');
const cellarEs = await render('es/bodega/index.html');
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

assert.ok(!(await exists('marques/index.html')));
assert.ok(!(await exists('es/marcas/index.html')));

for (const page of ['legal/index.html', 'es/legal/index.html']) {
  const html = await render(page);
  assert.match(html, /id="avis-legal"/);
  assert.match(html, /id="privacitat"/);
  assert.match(html, /id="cookies"/);
  assert.match(html, /B25433939/);
}

const admin = await fetch(`http://localhost:${port}/admin/`, { redirect: 'manual' });
assert.equal(admin.status, 302);
assert.match(admin.headers.get('location') ?? '', /\/admin\/login\/$/);
assert.doesNotMatch(await render('sitemap-0.xml'), /\/admin/);

console.log('Site metadata, robots.txt, sitemap, 404 and admin protection verified.');
process.exit(0);
