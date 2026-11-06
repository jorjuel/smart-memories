import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../', import.meta.url);

test('bow selection uses the customer-supplied styled photograph', () => {
  const page = readFileSync(new URL('app/create/bow/page.tsx', root), 'utf8');
  assert.match(page, /src="\/images\/smart-memories-bow-selection\.webp"/);
  assert.match(page, /alt="Smart Memories cream gift tag with a large rose-gold satin bow/);
  assert.doesNotMatch(page, /role="img" aria-label="Smart Memories decorative satin ribbon/);
});

test('the bow image is a valid WebP asset and adapts to mobile', () => {
  const image = new URL('public/images/smart-memories-bow-selection.webp', root);
  assert.ok(existsSync(image));
  const bytes = readFileSync(image);
  assert.ok(bytes.length > 3000);
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  assert.equal(bytes.readUInt32LE(4) + 8, bytes.length);
  const css = readFileSync(new URL('app/globals.css', root), 'utf8');
  assert.match(css, /\.smBowPage \.smBowPreviewArt \{[\s\S]*?object-fit: contain;/);
});
