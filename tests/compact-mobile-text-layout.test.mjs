import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('physical-gift wording choices use a dedicated compact selector', () => {
  const form = read('components/ProductPersonaliser.tsx');
  assert.match(form, /className="choiceGrid smWizardTextLayoutChoices"/);
  assert.match(form, /'choiceCard smWizardTextLayoutOption'/);
  assert.match(form, /aria-pressed=\{textLayout === item\}/);
  assert.match(form, /Words on the\s*physical gift/);
});

test('mobile layout has two short rows of words options, not one large card per row', () => {
  const css = read('app/globals.css');
  const index = css.lastIndexOf('@media (max-width: 700px)');
  assert.ok(index > -1);
  const mobile = css.slice(index);
  assert.match(mobile, /\.smWizardPage \.smWizardTextLayoutChoices \{\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(mobile, /\.smWizardTextLayoutOption \{\s*min-height: 48px/);
});
