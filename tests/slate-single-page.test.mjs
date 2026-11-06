import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const source=read('components/SlateSinglePageCustomiser.tsx');
const page=read('app/shop/[slug]/page.tsx');
const legacy=read('app/personalise/[slug]/page.tsx');
const review=read('app/slate/review/page.tsx');
const draftStorage=read('lib/slateReviewDraft.ts');

test('slate editor has all four requested physical sizes',()=>{
 for(const size of ['14 × 14 cm','19 × 19 cm','14 × 19 cm','19 × 29 cm'])
  assert.ok(source.includes(size),'Missing '+size);
});
test('slate product renders single-page customiser rather than a wizard',()=>{
 assert.match(page,/slug === 'smart-photo-slate'\) return <SlateSinglePageCustomiser/);
 assert.match(legacy,/slug === 'smart-photo-slate'\) return <SlateSinglePageCustomiser/);
 assert.doesNotMatch(source,/Next step|Next button|setStepIndex|<ProductPersonaliser/);
 assert.match(source,/className="slateStudioPreview"/);
 assert.match(source,/className="slateStudioControls smWizardFields"/);
});
test('slate builder retains photo controls and print uses the same composition on review',()=>{
 assert.match(source,/fit==='cover'\?Math\.max\(pw\/iw,ph\/ih\):Math\.min\(pw\/iw,ph\/ih\)/);
 assert.match(source,/onPointerDown=\{startDrag\}/);
 assert.match(source,/type="range"/);
 assert.match(review,/paint\(ctx,image,dimensions/);
 assert.match(review,/canvas\.toBlob/);
 assert.match(review,/printArtworkUrl:url\(printPath\)/);
});
test('written and recorded memories are composed together before a separate review page',()=>{
 assert.match(source,/Written message/);
 assert.match(source,/Voice message/);
 assert.match(source,/navigator\.mediaDevices\.getUserMedia/);
 assert.match(source,/MediaRecorder/);
 assert.match(source,/storeSlateDraft\(draft\)/);
 assert.match(source,/window\.location\.assign\('\/slate\/review'\)/);
 assert.match(review,/B. THEIR SMART MEMORY/);
 assert.match(review,/A. YOUR PHYSICAL GIFT/);
 assert.match(review,/<SmartMemoryLivePreview/);
 assert.match(review,/draft\.message/);
 assert.match(review,/audioUrl=\{audioUrl\}/);
 assert.match(review,/uploadMemoryMedia\(draft\.audio,'audio'\)/);
 assert.match(review,/form\.set\('audioPath',audioPath\)/);
 assert.match(review,/form\.set\('message',draft\.message\.trim\(\)\)/);
 assert.match(review,/printArtworkUrl:url\(printPath\)/);
 assert.match(draftStorage,/indexedDB\.open/);
 assert.match(review,/Go to basket/);
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
 assert.match(review,/slateOrientation:draft.direction,photoFit:draft.fit,photoRotation:draft.rotation/);
 assert.match(source,/ctx\.rotate\(rotation\*Math\.PI\/180\)/);
});

test('slate uses same dual preview and brand styling as other products',()=>{
 const css=read('app/globals.css');
 assert.match(review,/className="smWizardDualPreview"/);
 assert.match(review,/className="smWizardStepHeading"/);
 assert.match(review,/className="smWizardReviewSummary"/);
 assert.match(source,/className="slateStudio smWizardPage"/);
 assert.match(source,/Record My Voice/);
 assert.match(source,/Written message/);
 assert.match(css,/\.slateStudio\.smWizardPage/);
 assert.match(css,/var\(--sm-rose\)/);
 assert.match(css,/\.slateReview \.smWizardDualPreview/);
});

test('slate mockup has textured rough stone edges rather than a conventional frame',()=>{
 const css=read('app/globals.css');
 assert.match(source,/className="slateStoneShell"/);
 assert.match(review,/className="slateStoneShell"/);
 assert.match(css,/\.slateStoneShell\{/);
 assert.match(css,/clip-path:polygon\(/);
 assert.match(css,/repeating-linear-gradient/);
});
test('From field is required without an optional label',()=>{
 assert.match(source,/<label>From<input required aria-required="true"/);
 assert.doesNotMatch(source,/From \(optional\)/);
 assert.match(source,/if\(!sender\.trim\(\)\)/);
 assert.match(review,/if\(!draft\.sender\.trim\(\)\)/);
});
