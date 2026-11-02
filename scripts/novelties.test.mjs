import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { content } from '../src/data/content.ts';
import { listTextFields, mergeCopy } from '../src/lib/content-fields.ts';
import {
  legacyNovelties,
  noveltyHeading,
  NoveltyError,
  readNovelty,
  replaceNovelty,
  visibleNovelties,
} from '../src/lib/novelties.ts';

const migrated = legacyNovelties(content, {});
function formFor(item = migrated.items[0]) {
  const form = new FormData();
  form.set('section', item.section);
  form.set('order', String(item.order));
  if (item.active) form.set('active', 'on');
  for (const locale of /** @type {const} */ (['ca', 'es'])) {
    for (const [key, value] of Object.entries(item.copy[locale]))
      form.set(`${locale}|${key}`, value);
  }
  return form;
}

test('migration preserves all existing translations, heading and uploaded image metadata', () => {
  const ca = mergeCopy(content.ca, { cellar: { noveltyTamaral: { title: 'Títol desat' } } });
  const uploaded = {
    src: '/media/image/?k=pages%2Ftamaral.jpg',
    width: 900,
    height: 1200,
    type: 'image/jpeg',
  };
  const result = legacyNovelties({ ca, es: content.es }, { cellarNoveltyTamaral: uploaded });
  assert.equal(result.items.length, 3);
  assert.equal(result.items[2].copy.ca.title, 'Títol desat');
  assert.deepEqual(result.items[2].copy.es, content.es.cellar.noveltyTamaral);
  assert.deepEqual(result.items[2].image, uploaded);
  assert.equal(result.heading.es.title, content.es.food.noveltiesTitle);
});

test('visibility supports multiple ordered novelties, page reassignment, drafts and empty selections', () => {
  const data = structuredClone(migrated);
  data.items[0].order = 30;
  assert.deepEqual(
    visibleNovelties(data, 'food').map((item) => item.id),
    ['frime', 'imperfect'],
  );
  data.items[1].active = false;
  data.items[0].section = 'cellar';
  assert.deepEqual(visibleNovelties(data, 'food'), []);
  assert.equal(visibleNovelties(data, 'cellar').length, 2);
  assert.deepEqual(visibleNovelties({ ...data, items: [] }, 'cellar'), []);
});

test('editing retains identity and image while replacing a single item or adding a new one', () => {
  const item = migrated.items[0];
  const form = formFor(item);
  form.set('ca|title', '  Nova temporada  ');
  form.set('section', 'cellar');
  form.delete('active');
  const edited = readNovelty(form, item.id, item.image);
  assert.equal(edited.copy.ca.title, 'Nova temporada');
  assert.equal(edited.section, 'cellar');
  assert.equal(edited.active, false);
  assert.deepEqual(edited.image, item.image);
  const updated = replaceNovelty(migrated, edited);
  assert.equal(updated.items.length, 3);
  assert.equal(updated.items.filter((entry) => entry.id === item.id).length, 1);
  assert.equal(replaceNovelty(updated, { ...edited, id: 'new' }).items.length, 4);
  assert.notEqual(migrated.items[0].copy.ca.title, edited.copy.ca.title);
});

test('validation rejects incomplete translations, invalid sections, unsafe links and bad ordering', () => {
  for (const [key, value] of [
    ['section', 'home'],
    ['order', '-1'],
    ['order', '1.5'],
    ['order', 'NaN'],
    ['es|title', ''],
    ['ca|body', ''],
    ['es|imageAlt', ''],
    ['ca|href', 'javascript:alert(1)'],
    ['es|href', 'data:text/html,test'],
    ['ca|href', '/relative/'],
    ['ca|title', 'x'.repeat(10001)],
  ]) {
    const form = formFor();
    form.set(key, value);
    assert.throws(
      () => readNovelty(form, 'id', migrated.items[0].image),
      NoveltyError,
      `${key}: ${value.slice(0, 40)}`,
    );
  }
  const form = formFor();
  form.set('ca|href', 'https://example.com/');
  form.set('ca|link', '');
  assert.throws(() => readNovelty(form, 'id', migrated.items[0].image), /text de l’enllaç/);
  form.set('ca|href', '');
  assert.equal(readNovelty(form, 'id', migrated.items[0].image).copy.ca.href, '');
});

test('general text editor excludes novelty fields while legacy content remains migratable', () => {
  for (const section of /** @type {const} */ (['food', 'cellar'])) {
    assert.ok(
      listTextFields(content.ca[section], section).every((field) => !field.path.includes('novelt')),
    );
  }
  assert.ok(mergeCopy(content.ca, {}).cellar.noveltyTamaral.title);
  const imageEditor = readFileSync('src/pages/admin/imatges.astro', 'utf8');
  assert.match(imageEditor, /!isPageImageSlot\(slot\) \|\| noveltyImageSlots.has\(slot\)/);
});

test('cellar section heading has bilingual defaults and preserves independent admin edits', () => {
  const data = structuredClone(migrated);
  assert.equal(noveltyHeading(data, 'cellar', 'ca').kicker, 'Novetats');
  assert.equal(noveltyHeading(data, 'cellar', 'es').title, 'Productos destacados de la bodega.');
  const previousFood = structuredClone(data.heading);
  data.cellarHeading.ca = { kicker: 'Selecció', title: 'Vins per descobrir' };
  assert.equal(noveltyHeading(data, 'cellar', 'ca').title, 'Vins per descobrir');
  assert.deepEqual(data.heading, previousFood);
  // A catalogue already saved before this addition still renders without migration.
  const legacy = { heading: data.heading };
  assert.equal(noveltyHeading(legacy, 'cellar', 'ca').title, 'Productes destacats del celler.');
  assert.deepEqual(noveltyHeading(legacy, 'food', 'ca'), previousFood.ca);
});
