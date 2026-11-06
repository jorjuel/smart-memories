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

test('photo-only uses an expanded print area instead of the wide wording border',()=>{
 assert.match(source,/const photoOnly=way==='none'/);
 assert.match(source,/const inset=photoOnly\?w\*\.027:w\*\.072/);
 assert.match(source,/const topPadding=photoOnly\?h\*\.026:h\*\.047/);
});
test('framed photos default to contain and never force crop',()=>{
 assert.match(source,/useState<PhotoFit>\('contain'\)/);
 assert.match(source,/fit==='cover'\?Math\.max\(pw\/iw,ph\/ih\):Math\.min\(pw\/iw,ph\/ih\)/);
 assert.match(source,/Fit whole photo/);
 assert.match(source,/Fill area \(may crop\)/);
});
test('portrait and landscape slate direction and photo rotation can be selected',()=>{
 assert.match(source,/Slate direction/);
 assert.match(source,/Rotate left/);
 assert.match(source,/Rotate right/);
 assert.match(source,/slateOrientation:direction,photoFit:fit,photoRotation:rotation/);
 assert.match(source,/ctx\.rotate\(rotation\*Math\.PI\/180\)/);
});
