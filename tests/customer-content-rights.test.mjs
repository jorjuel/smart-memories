import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('checkout requires explicit customer copyright confirmation', () => {
  const page = read('app/checkout/page.tsx');
  assert.match(page, /checked={copyrightConfirmed}/);
  assert.match(page, /copyrightDeclarationAccepted: copyrightConfirmed/);
});

test('order API rejects missing rights declaration and records evidence server-side', () => {
  const route = read('app/api/orders/route.ts');
  assert.match(route, /body\.copyrightDeclarationAccepted !== true/);
  assert.match(route, /status: 400/);
  assert.match(route, /copyrightAcceptedAt = new Date\(\)\.toISOString\(\)/);
  assert.match(route, /copyrightDeclaration: \{/);
  assert.match(route, /acceptedAt: copyrightAcceptedAt/);
});

test('admin can inspect rights confirmation and hold suspicious orders', () => {
  const page = read('app/admin/(protected)/orders/[id]/page.tsx');
  assert.match(page, /Copyright and content rights review/);
  assert.match(page, /rightsConfirmed/);
  assert.match(page, /On Hold/);
});

test('terms reserve rights to refuse content', () => {
  const terms = read('app/terms/page.tsx');
  assert.match(terms, /request evidence of permission/);
  assert.match(terms, /refuse or cancel orders/);
});
