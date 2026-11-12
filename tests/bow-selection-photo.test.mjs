import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { memoryTagDesigns } from '../lib/memoryTagDesigns.ts';

test('the tag catalogue preserves all designs with unique IDs and images', () => {
  assert.equal(memoryTagDesigns.length, 65);
  assert.equal(new Set(memoryTagDesigns.map(design => design.id)).size, memoryTagDesigns.length);
  assert.equal(new Set(memoryTagDesigns.map(design => design.image)).size, memoryTagDesigns.length);
});

test('every tag design points to a PNG or JPEG asset matching its extension', () => {
  for (const design of memoryTagDesigns) {
    const asset = readFileSync(new URL(`../public${design.image}`, import.meta.url));
    if (design.image.endsWith('.png')) {
      assert.equal(asset.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', design.id);
    } else {
      assert.match(design.image, /\.jpe?g$/);
      assert.equal(asset.subarray(0, 3).toString('hex'), 'ffd8ff', design.id);
    }
  }
});
