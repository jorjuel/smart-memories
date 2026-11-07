import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
const shop=readFileSync(new URL('../app/shop/page.tsx',import.meta.url),'utf8');
test('shop navigation omits By occasion and uses Handcrafted cards',()=>{
 assert.doesNotMatch(shop,/href="#occasions"/);
 assert.doesNotMatch(shop,/>By occasion<\/Link>/);
 assert.match(shop,/<Link href="#cards">Handcrafted cards<\/Link>/);
});
test('shop removes occasion chooser without removing product, card or bundle sections',()=>{
 assert.doesNotMatch(shop,/<section id="occasions"/);
 assert.doesNotMatch(shop,/<h2>Shop by occasion<\/h2>/);
 assert.match(shop,/<section id="gifts"/);
 assert.match(shop,/<section id="cards"/);
 assert.match(shop,/<section id="bundles"/);
});
