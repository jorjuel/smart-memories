import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
const form = readFileSync(new URL('../components/ProductPersonaliser.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

test('gift design has no Choose size and no What is it for question', () => {
  assert.doesNotMatch(form, /What is it for\?/);
  assert.doesNotMatch(form, /Choose the size/);
  assert.match(form, /How many coasters would you like\?/);
  assert.match(form, /isCoaster && product\.sizes && product\.sizes\.length > 0/);
});

test('quick template offers just two expandable options, with selected artwork preview', () => {
  assert.match(form, /product\.templates\.slice\(0, 2\)\.map/);
  assert.match(form, /smDesignDropdownTrigger/);
  assert.match(form, /aria-expanded=\{template === item\}/);
  assert.match(form, /template === item && \(/);
  assert.match(form, /<ConfiguredProductPreview/);
  assert.match(form, /template=\{item\}/);
});

test('template selection applies to the persistent gift mockup', () => {
  assert.match(form, /setTemplate\(item\)/);
  assert.match(form, /template=\{mode === 'quick' && designSource === 'ours' \? template : null\}/);
  assert.match(css, /\.smDesignDropdownTrigger:hover, \.smDesignDropdownTrigger:focus-visible/);
});
