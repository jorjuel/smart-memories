import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { personalisationProducts } from '../lib/personalisationConfig.ts';

const form = readFileSync(new URL('../components/ProductPersonaliser.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

test('Quick Template shows the complete original design list for the current product', () => {
  assert.match(form, /product\.templates\.map\(\(item\) =>/);
  assert.doesNotMatch(form, /product\.templates\.slice\(0,\s*2\)/);
  assert.match(form, /\{product\.templates\.length \+ cloudFrames\.length\} ready-made styles/);
  const slate = personalisationProducts.find(item => item.slug === 'smart-photo-slate');
  assert.ok(slate);
  assert.equal(slate.templates.length, 12);
  assert.ok(slate.templates.includes('Floral Keepsake'));
  assert.ok(slate.templates.includes('Wedding Classic'));
  assert.ok(slate.templates.includes('Memorial Tribute'));
  for (const product of personalisationProducts) {
    assert.ok(product.templates.length > 2, `Expected all old designs retained for ${product.slug}`);
  }
});

test('An accessible dropdown selects the design and reveals the matching gift preview', () => {
  assert.match(form, /htmlFor="sm-select-gift-design"/);
  assert.match(form, /<select[\s\S]*?id="sm-select-gift-design"/);
  assert.match(form, /value=\{template\}/);
  assert.match(form, /onChange=\{\(event\) => \{[\s\S]*?setTemplate\(event\.target\.value\)/);
  assert.match(form, /<option key=\{item\} value=\{item\}>\{item\}<\/option>/);
  assert.match(form, /aria-live="polite"/);
  assert.match(form, /className="smDesignPickerArtwork"/);
  assert.match(form, /template=\{template\}/);
  assert.match(form, /template=\{mode === 'quick' && designSource === 'ours' \? template : null\}/);
});

test('The redesigned picker fits desktop and small screens without a long accordion', () => {
  assert.match(css, /\.smDesignPickerSelect\s*\{/);
  assert.match(css, /\.smDesignPickerResult\s*\{/);
  assert.match(css, /@media \(max-width: 600px\)/);
  assert.doesNotMatch(form, /smDesignDropdownItem/);
});

test('Size and unnecessary occasion questions remain removed', () => {
  assert.doesNotMatch(form, /What is it for\?/);
  assert.doesNotMatch(form, /Choose the size/);
  assert.match(form, /How many coasters would you like\?/);
});
