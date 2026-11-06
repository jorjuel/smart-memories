import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

function source(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('home and primary nav lead to one memory-first journey', () => {
  const home = source('app/page.tsx');
  const header = source('components/SiteHeader.tsx');
  const menu = source('app/menu/page.tsx');
  assert.match(home, /Start with a memory/);
  assert.match(home, /href="\/create">Create your Smart Memory/);
  assert.match(header, /Create a Memory &amp; Gifts/);
  assert.doesNotMatch(header, /href="\/shop"/);
  assert.match(menu, /Create a Memory & Add a Gift/);
});

test('shop landing preserves occasions but redirects into the same creator', () => {
  const shop = source('app/shop/page.tsx');
  assert.match(shop, /redirect\(occasion/);
  assert.match(shop, /\/create\?occasion=/);
});

test('the unified creator always starts with a message and offers gifts after saving', () => {
  const create = source('app/create/page.tsx');
  assert.doesNotMatch(create, /<CreateMemoryJourney/);
  assert.match(create, /unifiedJourney = !productSlug/);
  assert.match(create, /Written message <small>\(optional\)<\/small>/);
  assert.match(create, /STEP 1 OF 2 · YOUR MEMORY FIRST/);
  assert.match(create, /STEP 2 · CHOOSE HOW TO SHARE/);
  assert.match(create, /Your memory comes first\. Your gift is optional/);
  assert.match(create, /Pay £5 for digital memory/);
  assert.match(create, /Choose your bow colour/);
  assert.match(create, /Add this gift/);
  assert.match(create, /onClick=\{\(\) => addToBasket\(item\)\}/);
});

test('digital and tag use the existing code-backed checkout, without unexpected base charges', () => {
  const create = source('app/create/page.tsx');
  const price = source('lib/pricing.ts');
  const bow = source('app/create/bow/page.tsx');
  assert.match(create, /productSlug: 'digital-memory'/);
  assert.match(create, /router\.push\('\/checkout'\)/);
  assert.match(create, /\/create\/bow\?code=/);
  assert.match(bow, /tagSelected/);
  assert.match(price, /slug === 'memory-tag' \|\| slug === 'digital-memory'/);
});
