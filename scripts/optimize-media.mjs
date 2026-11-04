// Regenerate committed delivery assets with ImageMagick 7 and FFmpeg (libx264).
// Originals remain available for CMS references and future exports.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { AwsClient } from 'aws4fetch';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, extname, join } from 'node:path';
import { tmpdir } from 'node:os';

const imageDir = 'public/images/optimized';
const videoDir = 'public/media-static';
mkdirSync(imageDir, { recursive: true });
mkdirSync(videoDir, { recursive: true });
/** @param {string} command @param {string[]} args */
const run = (command, args) =>
  execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
/** @param {string} path */
const hash = (path) =>
  createHash('sha256').update(readFileSync(path)).update('delivery-v2').digest('hex').slice(0, 10);
/** @typedef {{width: number, height: number, variants: Array<{src: string, width: number, bytes: number}>}} ImageVariants */
/** @type {{images: Record<string, ImageVariants>, video: Record<string, string>, favicon: Record<string, string>}} */
const manifest = { images: {}, video: {}, favicon: {} };
let originalBytes = 0;
let largestVariantBytes = 0;
const inputs = readdirSync('public/images')
  .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
  .sort()
  .map((file) => ({
    path: join('public/images', file),
    src: `/images/${file}`,
    logo: /^(logo|xlogo|logotip|chovi|chocovic|benfumat-wordmark|millas-wordmark|moritz-mark-transparent|Es-imperfect_logo)/i.test(
      file,
    ),
  }));
let temporary;
if (process.argv.includes('--cms')) {
  if (existsSync('.env')) process.loadEnvFile('.env');
  const {
    DATABASE_URL,
    S3_ENDPOINT,
    S3_BUCKET,
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
    S3_REGION,
  } = process.env;
  if (!DATABASE_URL || !S3_ENDPOINT || !S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY)
    throw new Error('Configure local DB and S3 credentials before --cms');
  const sql = neon(DATABASE_URL);
  const [pages, logos, novelties] = await sql.transaction(
    [
      sql`SELECT object_key FROM site_images`,
      sql`SELECT logo_key FROM suppliers WHERE logo_key IS NOT NULL`,
      sql`SELECT data FROM site_novelties WHERE id = 1`,
    ],
    { readOnly: true },
  );
  const refs = new Set([
    ...pages.map((row) => `/media/image/?k=${encodeURIComponent(row.object_key)}`),
    ...logos.map((row) => `/media/logo/?k=${encodeURIComponent(row.logo_key)}`),
    ...(novelties[0]?.data?.items ?? []).map(
      (/** @type {{image: {src: string}}} */ item) => item.image.src,
    ),
  ]);
  const storage = new AwsClient({
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
    region: S3_REGION ?? 'eu-central-1',
    service: 's3',
  });
  temporary = mkdtempSync(join(tmpdir(), 'poblaliment-cms-images-'));
  for (const src of refs) {
    if (!src.startsWith('/media/')) continue;
    const key = new URL(src, 'https://poblaliment.com').searchParams.get('k');
    if (!key || !/^(pages|logos)\/[\w-]+\.(jpe?g|png|webp|avif)$/i.test(key)) continue;
    const url = `${S3_ENDPOINT.replace(/\/$/, '')}/${S3_BUCKET}/${key.split('/').map(encodeURIComponent).join('/')}`;
    const response = await storage.fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`CMS image download failed (${response.status})`);
    const path = join(temporary, basename(key));
    writeFileSync(path, new Uint8Array(await response.arrayBuffer()));
    inputs.push({ path, src, logo: key.startsWith('logos/') });
  }
} else if (existsSync('src/data/optimized-media.json')) {
  /** @type {{images: Record<string, ImageVariants>}} */
  const previous = JSON.parse(readFileSync('src/data/optimized-media.json', 'utf8'));
  for (const [src, image] of Object.entries(previous.images)) {
    if (src.startsWith('/media/')) manifest.images[src] = image;
  }
}

/** @type {Map<string, ImageVariants>} */
const generated = new Map();
for (const { path, src, logo } of inputs) {
  const fingerprint = hash(path);
  const profileKey = `${fingerprint}:${logo ? 'logo' : 'photo'}`;
  const reusable = generated.get(profileKey);
  if (reusable) {
    manifest.images[src] = reusable;
    continue;
  }
  const file = basename(path);
  // Brand marks are static UI; do not carry hundreds of animation frames into thumbnails.
  const frame = `${path}[0]`;
  const [width, height] = run('magick', [frame, '-auto-orient', '-format', '%w %h', 'info:'])
    .trim()
    .split(' ')
    .map(Number);
  const widths = [
    ...new Set(
      (logo ? [48, 96, 192, 384] : [320, 640, 960, 1280, 1600]).map((w) => Math.min(w, width)),
    ),
  ];
  const name = basename(file, extname(file))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .toLowerCase();
  const variants = widths.map((w) => {
    const target = `${imageDir}/${name}-${fingerprint}-${w}.webp`;
    if (!existsSync(target))
      run('magick', [
        '-limit',
        'thread',
        '2',
        frame,
        '-auto-orient',
        '-resize',
        `${w}x>`,
        '-strip',
        '-quality',
        logo ? '88' : '82',
        '-define',
        'webp:method=6',
        target,
      ]);
    // Already compressed JPEGs can be smaller than WebP at the primary quality.
    if (!logo && statSync(target).size >= statSync(path).size) {
      run('magick', [
        '-limit',
        'thread',
        '2',
        frame,
        '-auto-orient',
        '-resize',
        `${w}x>`,
        '-strip',
        '-quality',
        '74',
        '-define',
        'webp:method=6',
        target,
      ]);
    }
    return { src: target.replace(/^public/, ''), width: w, bytes: statSync(target).size };
  });
  manifest.images[src] = { width, height, variants };
  generated.set(profileKey, manifest.images[src]);
  originalBytes += statSync(path).size;
  largestVariantBytes += variants.at(-1)?.bytes ?? 0;
}

const logo = 'public/images/logo.jpg';
const logoHash = hash(logo);
for (const size of [32, 96, 180]) {
  const target = `${imageDir}/favicon-${logoHash}-${size}.png`;
  if (!existsSync(target))
    run('magick', [logo, '-resize', `${size}x${size}`, '-strip', `PNG32:${target}`]);
  manifest.favicon[size] = target.replace(/^public/, '');
}

const originalVideo = 'public/HeroVideo.mp4';
const videoHash = hash(originalVideo);
for (const height of [432, 720]) {
  for (const format of ['mp4']) {
    const target = `${videoDir}/hero-${videoHash}-${height}.${format}`;
    if (!existsSync(target))
      run('ffmpeg', [
        '-hide_banner',
        '-loglevel',
        'error',
        '-y',
        '-i',
        originalVideo,
        '-an',
        '-vf',
        `scale=-2:${height}`,
        '-threads',
        '2',
        '-c:v',
        'libx264',
        '-preset',
        'slow',
        '-crf',
        '28',
        '-pix_fmt',
        'yuv420p',
        '-movflags',
        '+faststart',
        target,
      ]);
    manifest.video[`${format}${height}`] = target.replace(/^public/, '');
  }
}
const poster = `${videoDir}/hero-${videoHash}-poster.webp`;
if (!existsSync(poster))
  run('ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-i',
    originalVideo,
    '-frames:v',
    '1',
    '-vf',
    'scale=960:-2',
    '-quality',
    '82',
    poster,
  ]);
manifest.video.poster = poster.replace(/^public/, '');
const referenced = new Set([
  ...Object.values(manifest.images).flatMap((image) =>
    image.variants.map((variant) => `public${variant.src}`),
  ),
  ...Object.values(manifest.favicon).map((src) => `public${src}`),
  ...Object.values(manifest.video).map((src) => `public${src}`),
]);
for (const directory of [imageDir, videoDir]) {
  for (const file of readdirSync(directory)) {
    const path = join(directory, file);
    if (!referenced.has(path)) rmSync(path);
  }
}
writeFileSync('src/data/optimized-media.json', `${JSON.stringify(manifest, null, 2)}\n`);
if (temporary) rmSync(temporary, { recursive: true, force: true });
console.log(
  JSON.stringify(
    {
      images: Object.keys(manifest.images).length,
      originalBytes,
      largestVariantBytes,
      videoOriginalBytes: statSync(originalVideo).size,
      video: Object.fromEntries(
        Object.entries(manifest.video).map(([key, src]) => [key, statSync(`public${src}`).size]),
      ),
    },
    null,
    2,
  ),
);
