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

test('memory choice cards appear immediately beneath the introductory sentence',()=>{
 const intro=shop.indexOf('Make your memory first, then choose how it is presented.');
 const grid=shop.indexOf('className="smMemoryPathGrid smShopMemoryPathGrid"');
 const links=shop.indexOf('<Link href="/create?mode=tag"',grid);
 const other=shop.indexOf('<Link href="/create?mode=gift"',grid);
 const shortcuts=shop.indexOf('className="smSimpleShopShortcuts"');
 assert.ok(intro>=0 && grid>intro && links>grid && other>links && shortcuts>other);
 assert.match(shop,/Memory Only/);
 assert.match(shop,/Memory \+ Gift/);
});

test('shop gift grid includes only five launch products',()=>{
 for(const slug of ['smart-photo-slate','coaster-set','photo-mug','keyring','mouse-mat'])
   assert.match(shop,new RegExp("'"+slug+"'"));
 assert.match(shop,/launchSlugs\.has\(p\.slug\)/);
 assert.match(shop,/const filtered = products\.filter/);
});
