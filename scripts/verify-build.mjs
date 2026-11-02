import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { content } from '../src/data/content.ts';
import { noveltyImageSlots, pageImageSlots } from '../src/data/page-images.ts';
import { fieldLabel, listTextFields, mergeCopy, setAtPath } from '../src/lib/content-fields.ts';

assert.equal(fieldLabel('home.galleryCaption'), 'Galeria · Figcaption');
assert.equal(fieldLabel('about.title'), 'Títol Google');
assert.equal(fieldLabel('about.description'), 'Descripció Google');
assert.equal(fieldLabel('about.values.0.title'), 'Valor › 1 › Subtítol');
assert.equal(fieldLabel('home.services.0.title'), 'Servei › 1 › Subtítol');
assert.equal(fieldLabel('about.imageAlt'), 'Text alternatiu (ALT)');
assert.equal(fieldLabel('home.gallery.0.alt'), 'Foto de la galeria › 1 › Text alternatiu (ALT)');
for (const defaults of Object.values(content)) {
  const legalFields = listTextFields(defaults.legal, 'legal');
  assert.ok(legalFields.some((field) => field.path === 'legal.privacy.rightsBody'));
  assert.ok(legalFields.some((field) => field.path === 'legal.notice.email.href'));
  const edited = structuredClone(defaults);
  setAtPath(edited, 'legal.privacy.rightsBody', 'Text legal editat');
  assert.equal(mergeCopy(defaults, edited).legal.privacy.rightsBody, 'Text legal editat');
  assert.deepEqual(mergeCopy(defaults, {}).legal, defaults.legal);
}

const removedCopyPaths = [
  'home.foodLink',
  'home.cellarLink',
  'about.imageCaption',
  'cellar.imageCaption',
  'contact.detailsTitle',
];
for (const [locale, defaults] of Object.entries(content)) {
  const fields = new Set(listTextFields(defaults).map((field) => field.path));
  for (const path of removedCopyPaths)
    assert.ok(!fields.has(path), `${locale}: obsolete field ${path}`);
  assert.ok(fields.has('home.brandsAction'));
  assert.ok(fields.has('food.imageCaption'));
  const stored = {
    ...structuredClone(defaults),
    home: { ...defaults.home, heading: 'Text editat a la base de dades', foodLink: 'Enllaç antic' },
  };
  const merged = mergeCopy(defaults, stored);
  assert.equal(merged.home.heading, stored.home.heading);
  assert.ok(!Object.hasOwn(merged.home, 'foodLink'));
  assert.deepEqual(mergeCopy(defaults, undefined), defaults);
}

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
assert.match(homeCa, /Consultar les nostres marques/);
assert.match(homeEs, /Consultar nuestras marcas/);
for (const [html, label] of [
  [homeCa, 'Marques'],
  [homeEs, 'Marcas'],
]) {
  const catalog = html.match(/<div class="catalog-links[\s\S]*?<\/div>/)?.[0] ?? '';
  assert.equal((catalog.match(/<button/g) ?? []).length, 1);
  assert.doesNotMatch(catalog, /<a /);
  assert.match(catalog, /aria-haspopup="menu"/);
  assert.match(html, new RegExp(`>${label}<svg`));
  assert.match(
    html,
    /signal-band border-y rule bg-\[var\(--color-blue\)\] text-\[var\(--color-paper\)\]/,
  );
  const signal = html.match(/<section class="signal-band[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.doesNotMatch(signal, /color-ink-soft/);
}
assert.doesNotMatch(homeCa, /Consultar Aliments|Consultar Celler/);
assert.doesNotMatch(homeEs, /Consultar Alimentos|Consultar Bodega/);

assert.ok(await exists('HeroVideo.mp4'));
assert.ok(await exists('images/chovi.png'));
assert.ok(await exists('images/olis-pons.svg'));
assert.ok(await exists('images/berlys.svg'));
assert.ok(await exists('images/moritz-mark-transparent.png'));
assert.ok(await exists('images/xlogo_trabanco.webp'));
assert.ok(await exists('images/logo_cambados.png'));
assert.ok(await exists('images/logo_benfumat.webp'));
assert.ok(await exists('images/chocovic-site-logo.png'));
assert.ok(await exists('images/logomillas.svg'));
assert.ok(await exists('images/logo_sarasa.png'));
assert.ok(await exists('images/logo_lagranja.png'));
assert.ok(await exists('images/logo_tamaric.png'));
assert.ok(await exists('images/logo_ecologica_pirineus.svg'));
assert.ok(await exists('images/logotip_cobo.png'));
assert.ok(await exists('images/logo-penelas.png'));
assert.ok(await exists('images/logo_pescamar.png'));
assert.ok(await exists('images/logo_ojos_guadiana.png'));
assert.ok(await exists('images/logo_pujadosolano.png'));
assert.ok(await exists('images/logo_capcanes.png'));

const notFound = await render('404.html');
assert.match(notFound, /name="robots" content="noindex, follow"/);

const robots = await render('robots.txt');
assert.match(robots, /Sitemap: https:\/\/www\.example\.com\/sitemap-index\.xml/);

assert.ok(await exists('sitemap-index.xml'));
assert.ok(await exists('sitemap-0.xml'));

const aboutCa = await render('nosaltres/index.html');
const aboutEs = await render('es/nosotros/index.html');
for (const html of [aboutCa, aboutEs]) {
  const hero = html.match(/<section class="page-frame about-intro[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.ok(hero.indexOf('<img') < hero.indexOf('<h1'));
  assert.match(hero, /text-center/);
  assert.match(hero, /loading="eager"/);
  assert.doesNotMatch(hero, /hero-grid|sm:pb-36/);
}
assert.match(aboutCa, /abril de 1999/);
assert.match(aboutCa, /PIGAL/);
assert.match(aboutCa, /src="\/images\/about-dawn\.jpeg"/);
assert.match(aboutCa, /src="\/images\/products-ubla\.jpeg"/);
assert.match(aboutCa, /anniversary-image overflow-hidden sm:-mt-6/);

assert.match(aboutEs, /abril de 1999/);
assert.match(aboutEs, /PIGAL/);
assert.match(aboutEs, /src="\/images\/about-dawn\.jpeg"/);
assert.match(aboutEs, /src="\/images\/products-ubla\.jpeg"/);
assert.match(aboutEs, /anniversary-image overflow-hidden sm:-mt-6/);

for (const page of ['aliments/index.html', 'es/alimentos/index.html']) {
  const html = await render(page);
  const hero =
    html.match(/<section class="page-frame page-intro food-intro[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.ok(hero.indexOf('<img') < hero.indexOf('<h1'));
  assert.match(hero, /text-center/);
  assert.match(hero, /loading="eager"/);
}

for (const page of ['contacte/index.html', 'es/contacto/index.html']) {
  const html = await render(page);
  assert.match(html, /mailto:info@poblaliment\.com/);
  assert.match(html, /tel:\+34973680341/);
  assert.match(html, /instagram\.com\/poblaliment/);
  assert.match(html, /<body class="contact-page">/);
  assert.match(
    html,
    /<aside class="self-center border-l-4 border-\[var\(--color-green\)\] py-1 pl-6">/,
  );
  assert.doesNotMatch(html, /<aside[^>]*border-t-4/);
  const details = html.match(/<aside[\s\S]*?<\/aside>/)?.[0] ?? '';
  assert.doesNotMatch(details, /<h2|mt-6/);
  assert.match(details, /<dl>/);
  assert.match(html, /<h2 class="display text-4xl sm:text-5xl">[^<]+<\/h2>/);
  assert.match(html, /contact-layout grid gap-10 pt-12 pb-10 md:grid-cols-/);
  assert.match(html, /md:pb-12/);
  assert.match(html, /<form[^>]*space-y-7/);
  assert.match(html, /<iframe[^>]*src="https:\/\/www\.google\.com\/maps\?[^"]*output=embed/);
  assert.doesNotMatch(html, /page-intro/);
}

const foodCa = await render('aliments/index.html');
const foodEs = await render('es/alimentos/index.html');
assert.match(foodCa, /Alimentació per a cada servei/);
assert.match(foodCa, /food-supplier-grid/);
assert.doesNotMatch(foodCa, /data-auto-rail/);
assert.match(foodCa, /href="#novetats"/);
assert.match(foodCa, /id="food-filter"/);
assert.match(foodCa, /Descobreix els aliments/);
assert.match(foodCa, /food-scroll-cue-spacing/);
assert.match(foodCa, /es im-perfect/);
assert.match(foodCa, /Bacallà selecte Frime/);
assert.match(foodCa, /src="\/images\/im-perfect\.jpeg"/);
assert.doesNotMatch(foodCa, />Moritz</);
assert.match(foodEs, /Alimentación para cada servicio/);
assert.match(foodEs, /food-supplier-grid/);
for (const html of [foodCa, foodEs]) {
  assert.match(html, /supplier-mark--chovi/);
  assert.match(html, /supplier-mark--pons/);
  assert.match(html, /supplier-mark--lagranja/);
  assert.match(html, /src="\/images\/berlys\.svg"/);
  assert.match(html, /src="\/images\/olis-pons\.svg"/);
  assert.match(html, /src="\/images\/chovi\.png"/);
  assert.match(html, /src="\/images\/Es-imperfect_logo_800\.webp"/);
  assert.match(html, /src="\/images\/logo_cambados\.png"/);
  assert.match(html, /src="\/images\/logo_sarasa\.png"/);
  assert.match(html, /src="\/images\/benfumat-wordmark\.png"/);
  assert.match(html, /src="\/images\/chocovic-site-logo\.png"/);
  assert.match(html, /src="\/images\/millas-wordmark\.png"/);
  assert.match(html, /src="\/images\/logo_lagranja\.png"/);
  assert.match(html, /src="\/images\/logo_tamaric\.png"/);
  assert.match(html, /src="\/images\/logo_ecologica_pirineus\.svg"/);
  assert.match(html, /src="\/images\/logotip_cobo\.png"/);
  assert.match(html, /src="\/images\/logo-penelas\.png"/);
  assert.match(html, /src="\/images\/logo_ojos_guadiana\.png"/);
  assert.match(html, /src="\/images\/logo_pescamar\.png"/);
  assert.match(html, /src="\/images\/logo_pujadosolano\.png"/);
}
assert.doesNotMatch(foodEs, /data-auto-rail/);
assert.match(foodEs, /href="#novetats"/);
assert.match(foodEs, /id="food-filter"/);
assert.match(foodEs, /Descubre los alimentos/);
assert.match(foodEs, /food-scroll-cue-spacing/);
assert.match(foodEs, /es im-perfect/);
assert.match(foodEs, /Bacalao selecto Frime/);

const cellarCa = await render('celler/index.html');
const cellarEs = await render('es/bodega/index.html');
assert.ok(await exists('images/pexels-allen-cullen-2740212-5934491.jpg'));
for (const html of [cellarCa, cellarEs]) {
  const hero =
    html.match(/<section class="page-frame page-intro cellar-intro[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.match(hero, /src="\/images\/pexels-allen-cullen-2740212-5934491\.jpg"/);
  assert.ok(hero.indexOf('<img') < hero.indexOf('<h1'));
  assert.match(hero, /text-center/);
  assert.match(hero, /loading="eager"/);
  assert.doesNotMatch(hero, /hero-grid|sm:pb-36/);
  assert.match(html, /src="\/images\/xlogo_trabanco\.webp"/);
  assert.match(html, /src="\/images\/logo_capcanes\.png"/);
}
assert.match(cellarCa, /Vins i escumosos/);
assert.match(cellarCa, /Bodegas Tamaral/);
assert.match(cellarCa, /src="\/images\/tamaral\.jpeg"/);
assert.match(cellarCa, />La nostra cervesa\.<\/h2>/);
assert.match(cellarCa, /moritz\/ca_ES\/images\/logo\.svg/);
assert.match(cellarCa, /cellar-scroll-cue/);
assert.match(cellarCa, /cellar-hero-stage/);
assert.match(cellarCa, /data-cellar-heading/);
assert.match(cellarCa, /data-cellar-copy/);
assert.match(cellarCa, /is-hidden-on-return/);
assert.match(cellarEs, /Vinos y espumosos/);
assert.match(cellarEs, /Bodegas Tamaral/);
assert.match(cellarEs, />Nuestra cerveza\.<\/h2>/);
assert.match(cellarEs, /moritz\/ca_ES\/images\/logo\.svg/);
assert.match(cellarEs, /cellar-scroll-cue/);
assert.match(cellarEs, /cellar-hero-stage/);
assert.match(cellarEs, /data-cellar-copy/);

const globalCss = readFileSync(resolve('src/styles/global.css'), 'utf8');
assert.doesNotMatch(globalCss, /\.signal-band::after/);
assert.match(
  globalCss,
  /\.featured-suppliers\s*{[^}]*grid-auto-flow: column;[^}]*grid-auto-columns: minmax\(18rem, 1fr\);[^}]*overflow-x: auto/s,
);
assert.match(
  globalCss,
  /@media \(max-width: 800px\)[\s\S]*?\.featured-suppliers\s*{[^}]*grid-auto-flow: row;[^}]*overflow-x: visible/s,
);
assert.doesNotMatch(globalCss, /\.featured-suppliers\s*{[^}]*repeat\(3,/s);
assert.match(globalCss, /\.supplier-mark\.supplier-mark--chovi\s*{[^}]*background: #0e793c/s);
assert.match(globalCss, /\.supplier-mark\.supplier-mark--pons\s*{[^}]*background: #000000/s);
assert.match(globalCss, /\.supplier-mark\.supplier-mark--lagranja\s*{[^}]*background: #486e4b/s);
assert.match(
  globalCss,
  /\.food-rail-item \.supplier-mark--tamaric\s*{[^}]*background: transparent/s,
);
assert.match(
  globalCss,
  /\.food-rail-item \.supplier-mark--tamaric img\s*{[^}]*mix-blend-mode: multiply/s,
);
for (const asset of ['benfumat-wordmark.png', 'millas-wordmark.png']) {
  assert.ok(await exists(`images/${asset}`));
}
assert.match(globalCss, /\.site-header nav > astro-island\s*{[^}]*display: flex/s);
assert.match(globalCss, /\.brands-trigger--navigation\s*{[^}]*line-height: 1\.25rem/s);
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
const protectedImages = await fetch(`http://localhost:${port}/admin/imatges/`, {
  redirect: 'manual',
});
assert.equal(protectedImages.status, 302);
for (const key of ['../secret.png', 'logos/test.svg', 'pages/bad.exe']) {
  const invalidMedia = await fetch(
    `http://localhost:${port}/media/image/?k=${encodeURIComponent(key)}`,
  );
  assert.equal(invalidMedia.status, 404);
}

// Exercise the protected supplier editor with a short-lived local test session.
if (existsSync('.dev.vars')) process.loadEnvFile('.dev.vars');
if (process.env.SESSION_SECRET) {
  const payload = `${Buffer.from('poblaliment').toString('base64url')}.${Math.floor(Date.now() / 1000) + 60}`;
  const signature = createHmac('sha256', process.env.SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  const response = await fetch(`http://localhost:${port}/admin/proveidors/nou/`, {
    headers: { Cookie: `poblaliment_admin=${payload}.${signature}` },
    redirect: 'manual',
  });
  assert.equal(response.status, 200);
  const editor = await response.text();
  assert.match(editor, /Seleccionar imatge/);
  assert.match(editor, /Cap fitxer seleccionat/);
  assert.match(editor, /aria-describedby="logo-file-name logo-file-help"/);
  assert.match(editor, /La imatge es pujarà quan premis «Desar»/);
  assert.match(editor, /name="logo" type="file"/);
  assert.match(editor, /enctype="multipart\/form-data"/);
  assert.match(editor, /Destacat/);
  const categoriesResponse = await fetch(`http://localhost:${port}/admin/categories/`, {
    headers: { Cookie: `poblaliment_admin=${payload}.${signature}` },
    redirect: 'manual',
  });
  assert.equal(categoriesResponse.status, 200);
  const categoriesEditor = await categoriesResponse.text();
  assert.match(categoriesEditor, /<option value="beer"[^>]*>Destacat<\/option>/);
  assert.doesNotMatch(categoriesEditor, /Cervesa \(destacat del Celler\)/);
  const adminHeaders = { Cookie: `poblaliment_admin=${payload}.${signature}` };
  const noveltiesResponse = await fetch(`http://localhost:${port}/admin/novetats/`, {
    headers: adminHeaders,
  });
  assert.equal(noveltiesResponse.status, 200);
  const noveltiesEditor = await noveltiesResponse.text();
  assert.match(noveltiesEditor, /Afegir novetat/);
  assert.match(noveltiesEditor, /Alimentació/);
  assert.match(noveltiesEditor, /Celler/);
  const newNovelty = await fetch(`http://localhost:${port}/admin/novetats/nova/`, {
    headers: adminHeaders,
  });
  assert.equal(newNovelty.status, 200);
  const noveltyForm = await newNovelty.text();
  assert.match(noveltyForm, /enctype="multipart\/form-data"/);
  for (const field of [
    'ca|title',
    'es|title',
    'ca|body',
    'es|imageAlt',
    'active',
    'order',
    'section',
  ]) {
    assert.ok(noveltyForm.includes(`name="${field}"`), `Missing novelty field ${field}`);
  }
  const staleNovelty = new FormData();
  staleNovelty.set('revision', '-1');
  const staleResponse = await fetch(`http://localhost:${port}/admin/novetats/nova/`, {
    method: 'POST',
    headers: adminHeaders,
    body: staleNovelty,
  });
  assert.match(await staleResponse.text(), /Una altra sessió ha fet canvis/);
  const generalTexts = await fetch(`http://localhost:${port}/admin/textos/?seccio=cellar`, {
    headers: adminHeaders,
  });
  const generalTextEditor = await generalTexts.text();
  assert.doesNotMatch(generalTextEditor, /name="(?:ca|es)\|cellar\.novelty/);
  const imagesEditorResponse = await fetch(`http://localhost:${port}/admin/imatges/`, {
    headers: { Cookie: `poblaliment_admin=${payload}.${signature}` },
    redirect: 'manual',
  });
  assert.equal(imagesEditorResponse.status, 200);
  const imagesEditor = await imagesEditorResponse.text();
  assert.match(imagesEditor, /Desar imatge/);
  assert.match(imagesEditor, /Recuperar original/);
  assert.match(imagesEditor, /name="slot" value="aboutHero"/);
  assert.match(imagesEditor, /name="slot" value="cellarHero"/);
  assert.match(imagesEditor, /name="slot" value="homeGalleryMain"/);
  assert.equal(
    (imagesEditor.match(/id="page-image-/g) ?? []).length,
    Object.keys(pageImageSlots).filter((slot) => !noveltyImageSlots.has(slot)).length * 2,
  );
  for (const slot of noveltyImageSlots)
    assert.ok(!imagesEditor.includes(`name="slot" value="${slot}"`));
  const protectedNoveltyImage = new FormData();
  protectedNoveltyImage.set('slot', 'cellarNoveltyTamaral');
  protectedNoveltyImage.set('action', 'restore');
  const rejectedNoveltyImage = await fetch(`http://localhost:${port}/admin/imatges/`, {
    method: 'POST',
    headers: adminHeaders,
    body: protectedNoveltyImage,
  });
  assert.match(await rejectedNoveltyImage.text(), /Aquesta imatge no existeix/);
  const invalidImage = new FormData();
  invalidImage.set('slot', 'aboutHero');
  invalidImage.set('action', 'upload');
  const noFile = await fetch(`http://localhost:${port}/admin/imatges/`, {
    method: 'POST',
    headers: { Cookie: `poblaliment_admin=${payload}.${signature}` },
    body: invalidImage,
  });
  assert.match(await noFile.text(), /Selecciona una imatge abans de desar/);
  const legalEditorResponse = await fetch(`http://localhost:${port}/admin/textos/?seccio=legal`, {
    headers: { Cookie: `poblaliment_admin=${payload}.${signature}` },
    redirect: 'manual',
  });
  assert.equal(legalEditorResponse.status, 200);
  const legalEditor = await legalEditorResponse.text();
  assert.match(legalEditor, /name="ca\|legal\.privacy\.rightsBody"/);
  assert.match(legalEditor, /name="es\|legal\.privacy\.rightsBody"/);
  assert.match(legalEditor, /name="ca\|legal\.title"/);
  assert.match(legalEditor, /name="es\|legal\.cookies\.usage"/);
}

console.log('Site metadata, robots.txt, sitemap, 404 and admin protection verified.');
process.exit(0);
