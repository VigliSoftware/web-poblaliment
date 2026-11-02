// @ts-nocheck -- Executed inside Playwright CLI, which supplies the browser types at runtime.
// Run with Playwright CLI's run-code command, passing this function's toString().
export default async function verifyImageLayout(page) {
  const check = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/', '/es/', '/celler/', '/es/bodega/']) {
      await page.goto(`http://localhost:4321${route}`, { waitUntil: 'domcontentloaded' });
      const home = route === '/' || route === '/es/';
      const section = page.locator(home ? '.gallery-grid' : '.novelty-feature-grid').first();
      await section.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      const image = section.locator(home ? '.gallery-feature img' : '.novelty-image-contained img');
      await image.evaluate(async (el) => {
        if (!el.complete) {
          await new Promise((resolve, reject) => {
            el.addEventListener('load', resolve, { once: true });
            el.addEventListener('error', reject, { once: true });
          });
        }
        await el.decode();
      });
      const metrics = await image.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const figure = el.parentElement.getBoundingClientRect();
        const caption = el.parentElement.querySelector('figcaption')?.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          naturalRatio: el.naturalWidth / el.naturalHeight,
          fit: getComputedStyle(el).objectFit,
          inside: rect.top >= figure.top - 1 && rect.bottom <= figure.bottom + 1,
          captionInside: !caption || caption.bottom <= figure.bottom + 1,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      check(metrics.width > 0 && metrics.height > 0, `${route} at ${width}: image is visible`);
      check(!metrics.overflow, `${route} at ${width}: no horizontal overflow`);
      check(metrics.inside, `${route} at ${width}: image stays inside its figure`);
      if (home) {
        check(
          Math.abs(metrics.width / metrics.height - 1.5) < 0.01,
          'Truck uses a landscape frame',
        );
        check(metrics.height < 600, 'Gallery height stays bounded on desktop');
        check(metrics.captionInside, 'Truck caption remains visible');
        if (width > 800) {
          const aligned = await section.evaluate((el) => {
            const main = el.querySelector('.gallery-feature').getBoundingClientRect();
            const stack = el.querySelector('.gallery-stack').getBoundingClientRect();
            return Math.abs(main.height - stack.height) < 1;
          });
          check(aligned, 'Supporting photographs align with the main figure');
        }
      } else {
        check(metrics.fit === 'contain', 'Tamaral displays the entire photograph');
        check(metrics.height <= 544, 'Tamaral photograph has a bounded maximum height');
        check(
          Math.abs(metrics.width / metrics.height - metrics.naturalRatio) < 0.01,
          'Tamaral preserves the original aspect ratio',
        );
      }
      if ((width === 390 || width === 1440) && (route === '/' || route === '/celler/')) {
        await section.locator('img').evaluateAll(async (images) => {
          await Promise.all(images.map((image) => image.decode()));
        });
        await section.screenshot({
          path: `output/playwright/${home ? 'gallery' : 'cellar'}-${width}-after.png`,
          animations: 'disabled',
          timeout: 10000,
        });
      }
      console.log(`PASS ${route} at ${width}px`);
    }
  }
}
