import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { getGiftTemplateTheme } from '../lib/giftTemplateTheme.ts';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('wizard starts with product photos, then design, memory message, and optional voice', () => {
  const code = read('components/ProductPersonaliser.tsx');
  const steps = code.slice(code.indexOf('const steps ='),code.indexOf('const [\n    stepIndex,'));
  const keys = [...steps.matchAll(/key: '(photo|gift|message|voice|preview|ready)'/g)].map(m => m[1]);
  assert.deepEqual(keys, ['photo','gift','message','voice','preview','ready']);
  assert.match(code, /Choose your main picture first, then add any extra collage/);
  assert.match(code, /Select quantity\/size before extra photos/);
});

test('creation method precedes the design dropdown, direction and gift wording', () => {
  const code = read('components/ProductPersonaliser.tsx');
  const start = code.indexOf("currentStep ===\n            'gift'");
  const end = code.indexOf("currentStep ===\n            'photo'", start);
  const design = code.slice(start,end);
  const order = [
    'How would you',
    'Choose a\n                      design',
    'Which\n                      direction?',
    'Words on the\n                      physical gift',
  ].map(text => design.indexOf(text));
  assert.ok(order.every(pos => pos >= 0), 'All builder controls must remain available');
  assert.ok(order.every((pos, i) => i === 0 || pos > order[i - 1]), 'Builder controls must be in requested order');
  assert.doesNotMatch(design, /What is it for\?/);
});

test('tapping a quick template changes the live gift preview without modifying the uploaded images', () => {
  const code = read('components/ProductPersonaliser.tsx');
  const preview = read('components/ConfiguredProductPreview.tsx');
  assert.match(code, /onClick=\{\(\) => \{\s*\/\/ The live gift mockup reacts[\s\S]*?setTemplate\(item\)/);
  assert.match(code, /template=\{mode === 'quick' && designSource === 'ours' \? template : null\}/);
  assert.match(preview, /data-template-theme=\{templateTheme \|\| undefined\}/);
});

test('mobile preview remains visible and uses the current photos and design', () => {
  const source = read('components/ProductPersonaliser.tsx');
  const css = read('app/globals.css');
  assert.match(source, /smWizardPhoneLivePreview/);
  assert.match(source, /smWizardPhonePreviewArtwork/);
  assert.match(css, /\.smWizardPhoneLivePreview \{\s*position: sticky;/);
  assert.match(css, /top: 79px;/);
});

test('recognisable ready-made styles map to different visual themes', () => {
  assert.equal(getGiftTemplateTheme('Floral Keepsake'), 'floral');
  assert.equal(getGiftTemplateTheme('Wedding Classic'), 'wedding');
  assert.equal(getGiftTemplateTheme('Birthday Celebration'), 'celebration');
  assert.equal(getGiftTemplateTheme('Memorial Tribute'), 'memorial');
  assert.equal(getGiftTemplateTheme('Minimal Photo'), 'modern');
});
