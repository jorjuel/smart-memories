import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const source=read('components/SlateSinglePageCustomiser.tsx');
const page=read('app/shop/[slug]/page.tsx');
const legacy=read('app/personalise/[slug]/page.tsx');

test('slate editor has all four requested physical sizes',()=>{
 for(const size of ['14 × 14 cm','19 × 19 cm','14 × 19 cm','19 × 29 cm'])
  assert.ok(source.includes(size),'Missing '+size);
});
test('slate product renders single-page customiser rather than a wizard',()=>{
 assert.match(page,/slug === 'smart-photo-slate'\) return <SlateSinglePageCustomiser/);
 assert.match(legacy,/slug === 'smart-photo-slate'\) return <SlateSinglePageCustomiser/);
 assert.doesNotMatch(source,/Next step|Next button|setStepIndex|<ProductPersonaliser/);
 assert.match(source,/className="slateStudioPreview"/);
 assert.match(source,/className="slateStudioControls"/);
});
test('auto image fit, zoom, dragging and live print artwork use same canvas',()=>{
 assert.match(source,/Math.max\(pw\/image\.naturalWidth,ph\/image\.naturalHeight\)/);
 assert.match(source,/onPointerDown=\{startDrag\}/);
 assert.match(source,/type="range"/);
 assert.match(source,/canvas\.toBlob/);
 assert.match(source,/printArtworkUrl:printedUrl/);
});
test('optional Smart Memory message saves with photo and basket has no immediate redirect',()=>{
 assert.match(source,/form\.set\('message',message\.trim\(\)\)/);
 assert.match(source,/form\.set\('photoPath',photoPath\)/);
 assert.match(source,/setAdded\(true\)/);
 assert.doesNotMatch(source,/window\.location\.href/);
});
