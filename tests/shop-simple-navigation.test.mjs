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

test('shop hero follows the centred editorial reference without the boxed banner',()=>{
 const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
 assert.match(shop,/Find a gift\. Create a memory\./);
 assert.match(shop,/Make it unforgettable\./);
 assert.match(shop,/Tap\. Remember\. Relive\./);
 assert.match(shop,/How would you like to share your memory\?/);
 assert.match(shop,/Both choices use the same photo, voice and message creator\./);
 assert.match(shop,/smSimpleShopHeroEditorial/);
 assert.match(css,/\.smSimpleShopHero\.smSimpleShopHeroEditorial\{/);
 assert.match(css,/background:transparent/);
 assert.match(css,/text-align:center/);
});
