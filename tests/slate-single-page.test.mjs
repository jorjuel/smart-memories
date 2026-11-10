import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const source=read('components/SlateSinglePageCustomiser.tsx');
const page=read('app/shop/[slug]/page.tsx');
const legacy=read('app/personalise/[slug]/page.tsx');
const review=read('app/slate/review/page.tsx');
const draftStorage=read('lib/slateReviewDraft.ts');
const profiles=read('lib/giftStudioProducts.ts');
const otherGiftReview=read('app/gift/review/[slug]/page.tsx');

test('slate editor has all four requested physical sizes',()=>{
 for(const size of ['14 × 14 cm','19 × 19 cm','14 × 19 cm','19 × 29 cm'])
  assert.ok(profiles.includes(size),'Missing '+size);
});
test('slate product renders single-page customiser rather than a wizard',()=>{
 assert.match(page,/isGiftStudioProduct\(slug\)\) return <SlateSinglePageCustomiser productSlug=\{slug\}/);
 assert.match(legacy,/isGiftStudioProduct\(slug\)\) return <SlateSinglePageCustomiser productSlug=\{slug\}/);
 assert.doesNotMatch(source,/Next step|Next button|setStepIndex|<ProductPersonaliser/);
 assert.match(source,/className="slateStudioPreview"/);
 assert.match(source,/className="slateStudioControls smWizardFields"/);
});
test('slate builder retains photo controls and print uses the same composition on review',()=>{
 assert.match(source,/fit==='cover'\?Math\.max\(pw\/iw,ph\/ih\):Math\.min\(pw\/iw,ph\/ih\)/);
 assert.match(source,/onPointerDown=\{productSlug==='keyring'&&keyringSide==='back'\?undefined:startDrag\}/);
 assert.match(source,/type="range"/);
 assert.match(review,/paint\(ctx,productSlug==='coaster-set'/);
 assert.match(review,/canvas\.toBlob/);
 assert.match(review,/printArtworkUrl:url\(printPath\)/);
});
test('written and recorded memories are composed together before a separate review page',()=>{
 assert.match(source,/Smart Writing Message/);
 assert.match(source,/Voice message/);
 assert.match(source,/navigator\.mediaDevices\.getUserMedia/);
 assert.match(source,/MediaRecorder/);
 assert.match(source,/storeSlateDraft\(draft\)/);
 assert.match(source,/window\.location\.assign\(productSlug==='smart-photo-slate'\?'\/slate\/review'/);
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
 assert.match(source,/const inset=edgeToEdge\?0:photoOnly\?w\*\.027:w\*\.072/);
 assert.match(source,/const topPadding=edgeToEdge\?0:photoOnly\?h\*\.026:h\*\.047/);
});
test('framed photos default to contain and never force crop',()=>{
 assert.match(source,/useState<PhotoFit>\(productSlug==='keyring'\?'cover':'contain'\)/);
 assert.match(source,/fit==='cover'\?Math\.max\(pw\/iw,ph\/ih\):Math\.min\(pw\/iw,ph\/ih\)/);
 assert.match(source,/Fit whole photo/);
 assert.match(source,/Fill area \(may crop\)/);
});
test('portrait and landscape slate direction and photo rotation can be selected',()=>{
 assert.match(source,/\{config\.label\} direction/);
 assert.match(source,/Rotate left/);
 assert.match(source,/Rotate right/);
 assert.match(review,/slateOrientation:draft.direction,photoFit:productSlug==='keyring'\?'cover':draft.fit,photoRotation:draft.rotation/);
 assert.match(source,/ctx\.rotate\(rotation\*Math\.PI\/180\)/);
});

test('slate uses same dual preview and brand styling as other products',()=>{
 const css=read('app/globals.css');
 assert.match(review,/className="smWizardDualPreview"/);
 assert.match(review,/className="smWizardStepHeading"/);
 assert.match(review,/className="smWizardReviewSummary"/);
 assert.match(source,/className="slateStudio smWizardPage"/);
 assert.match(source,/Record My Voice/);
 assert.match(source,/Smart Writing Message/);
 assert.match(css,/\.slateStudio\.smWizardPage/);
 assert.match(css,/var\(--sm-rose\)/);
 assert.match(css,/\.slateReview \.smWizardDualPreview/);
});

test('slate mockup has textured rough stone edges rather than a conventional frame',()=>{
 const css=read('app/globals.css');
 assert.match(source,/slateStoneShell/);
 assert.match(review,/slateStoneShell/);
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

test('the four other launch products share the slate creation and final review path',()=>{
 for(const slug of ['coaster-set','photo-mug','keyring','mouse-mat']){
  assert.ok(profiles.includes("'"+slug+"'"),'Missing profile '+slug);
 }
 assert.match(otherGiftReview,/SlateReviewPage productSlug=\{slug\}/);
 assert.match(review,/productSlug='smart-photo-slate'/);
 assert.match(draftStorage,/keyFor\(draft\.productSlug\)/);
 assert.match(draftStorage,/store\.get\(keyFor\(slug\)\)/);
 assert.match(review,/productSlug,\s*\n\s*memoryCode/);
 assert.match(review,/price:giftPrice/);
 assert.match(review,/name:selectedConfig\.name/);
});
test('all five gift previews share the layout but use different product mockups',()=>{
 const css=read('app/globals.css');
 for(const shape of ['slate','coaster','mug','keyring','mat']){
  assert.ok(profiles.includes("shape:'"+shape+"'"));
  if(shape!=='slate')assert.match(css,new RegExp('\\.slateProductShell--'+shape));
 }
});

test('coaster sets can retain distinct print photos with first-image fallback',()=>{
 assert.match(source,/extraCoasterPhotos/);
 assert.match(source,/multiple=\{productSlug==='coaster-set'\}/);
 assert.match(review,/artworkFor\(picture,index\+1\)/);
 assert.match(review,/printPaths\[index\]\|\|printPaths\[0\]/);
 assert.match(review,/coasterCount:productSlug==='coaster-set'/);
});

test('coaster sets expose visible extra photo upload and replace actions',()=>{
 assert.match(source,/Add photo for coaster/);
 assert.match(source,/Replace photo/);
 assert.match(source,/CoasterPhotoThumbnail/);
 assert.match(source,/function addCoasterPhoto/);
});

test('all six coaster slots and their individual design previews are available',()=>{
 assert.match(source,/\[1,2,4,6\]\[sizeIndex\]/);
 assert.match(source,/Array\.from\(\{length:coasterCount\}/);
 assert.match(source,/setSelectedCoaster\(index\)/);
 assert.match(source,/coasterPreviewImage\|\|image/);
 assert.match(review,/selectedReviewCoaster/);
 assert.match(review,/CoasterReviewThumbnail file=\{file\} index=\{index\}/);
 assert.match(review,/reviewCoasterImage\|\|image/);
});

test('final review shows touch-friendly thumbnails beneath large coaster preview',()=>{
 const css=read('app/globals.css');
 assert.match(review,/className="smCoasterReviewThumbnails"/);
 assert.match(review,/file=\{file\} index=\{index\}/);
 assert.match(review,/onSelect=\{\(\)=>setSelectedReviewCoaster\(index\)\}/);
 assert.match(review,/aria-pressed=\{active\}/);
 assert.match(review,/Reusing photo 1/);
 assert.match(css,/\.smCoasterReviewThumbnails\{/);
 assert.match(css,/overflow-x:auto/);
 assert.match(css,/\.smCoasterReviewThumb\.smCoasterSelected/);
});

test('selected coaster can become main NFC Smart Memory photo without dropping the original',()=>{
 assert.match(source,/function makeSelectedCoasterMain/);
 assert.match(source,/setPhoto\(chosen\)/);
 assert.match(source,/previousMain:file/);
 assert.match(review,/function promoteSelectedCoaster/);
 assert.match(review,/newExtras\[index-1\]=oldMain/);
 assert.match(review,/photo:replacement,extraCoasterPhotos:newExtras/);
 assert.match(review,/await storeSlateDraft\(updated\)/);
 assert.match(review,/setPhotoPreviewUrl\(url\)/);
 assert.match(review,/Swap with 1/);
});

test('a swap button is directly available below each uploaded coaster picture',()=>{
 assert.match(review,/className="smCoasterReviewTile"/);
 assert.match(review,/className="smCoasterSwapButton"/);
 assert.match(review,/onClick=\{\(\)=>void promoteSelectedCoaster\(index\)\}/);
 assert.match(review,/draft\.extraCoasterPhotos\?\.\[index-1\]/);
 assert.match(review,/setSelectedReviewCoaster\(0\)/);
});

test('keyring shape options carry through editor, review and print export',()=>{
 const css=read('app/globals.css');
 assert.match(profiles,/label:'Rectangular',width:3,height:4/);
 assert.match(profiles,/label:'Round',width:1,height:1/);
 assert.match(source,/roundKeyring=productSlug==='keyring'&&sizeIndex===1/);
 assert.match(source,/rotation,roundKeyring,productSlug==='keyring'/);
 assert.match(review,/keyringShape:productSlug==='keyring'\?size.label:undefined/);
 assert.match(review,/mime=roundKeyring\?'image\/png':'image\/jpeg'/);
 assert.match(review,/rotation,roundKeyring,productSlug==='keyring'/);
 assert.match(css,/\.slateProductShell--keyring\.slateProductShell--roundKeyring/);
});

test('keyring photo fills both shapes from edge to edge in editor and review artwork',()=>{
 assert.match(source,/const inset=edgeToEdge\?0:/);
 assert.match(source,/const topPadding=edgeToEdge\?0:/);
 assert.match(source,/const bottomPadding=edgeToEdge\?0:/);
 assert.match(source,/const topSpace=edgeToEdge\?0:/);
 assert.match(source,/setFit\(productSlug==='keyring'\?'cover':'contain'\)/);
 assert.match(source,/productSlug==='keyring'\?'cover':saved.fit/);
 assert.match(source,/productSlug==='keyring'\?'cover':fit,rotation/);
 assert.match(review,/productSlug==='keyring'\?'cover':draft.fit/);
 assert.match(review,/productSlug==='keyring'\?'cover':draft!.fit/);
 assert.match(review,/roundKeyring,productSlug==='keyring'/);
 assert.match(source,/roundKeyring,productSlug==='keyring'/);
});

test('both keyring shapes have photo-only fronts, message backs and separate printable files',()=>{
 const drafts=read('lib/slateReviewDraft.ts');
 assert.match(source,/export function paintKeyringBack/);
 assert.match(source,/productSlug==='keyring'&&keyringSide==='back'/);
 assert.match(source,/paintKeyringBack\(ctx,size,keyringBackText,roundKeyring\)/);
 assert.match(source,/productSlug==='keyring'\?'none':wording/);
 assert.match(source,/Message on the back of your keyring/);
 assert.match(source,/maxLength=\{180\} value=\{keyringBackText\}/);
 assert.match(source,/Front · Photo/);
 assert.match(source,/Back · Message/);
 assert.match(drafts,/keyringBackText\?: string/);
 assert.match(review,/paintKeyringBack\(ctx,dimensions,draft.keyringBackText\|\|'',roundKeyring\)/);
 assert.match(review,/productSlug==='keyring'\?'none':draft.wording/);
 assert.match(review,/printFiles.push\(new File\(\[backBlob\],'keyring-back-print.png'/);
 assert.match(review,/backArtworkUrl:productSlug==='keyring'/);
 assert.match(review,/printArtworkUrls:productSlug==='keyring'/);
 assert.match(review,/Preview front and back of your keyring/);
});

test('digital message section is clearly separate from printed keyring back wording',()=>{
 assert.match(source,/Now creating your Smart Message/);
 assert.match(source,/Smart Writing Message/);
 assert.match(source,/This message appears when someone opens your digital Smart Memory/);
 assert.match(source,/Message on the back of your keyring/);
});

test('Smart Memory controls appear in voice, sender/recipient, then writing order',()=>{
 const voice=source.indexOf('<fieldset className="slateVoiceCard smWizardVoiceCard">');
 const people=source.indexOf('<div className="slatePersonFields smWizardFields">');
 const writing=source.indexOf('<label><strong>Smart Writing Message');
 assert.ok(voice>=0&&people>voice&&writing>people,'Smart Memory section order is incorrect');
 assert.match(source,/Now creating your Smart Message/);
});

test('all five launch products share the approved Smart Message field order',()=>{
 for(const slug of ['smart-photo-slate','photo-mug','coaster-set','mouse-mat','keyring'])
  assert.ok(profiles.includes("'"+slug+"'"),'Missing product '+slug);
 assert.match(page,/isGiftStudioProduct\(slug\)\) return <SlateSinglePageCustomiser productSlug=\{slug\}/);
 const voice=source.indexOf('<fieldset className="slateVoiceCard smWizardVoiceCard">');
 const names=source.indexOf('<div className="slatePersonFields smWizardFields">');
 const writing=source.indexOf('<label><strong>Smart Writing Message');
 assert.ok(voice>=0&&names>voice&&writing>names);
 assert.equal(source.split('Now creating your Smart Message').length-1,1,'Use single shared digital message section');
});

test('public Smart Memory page has bounded loading and recoverable failure',()=>{
 const memoryPage=read('app/m/[code]/page.tsx');
 assert.match(memoryPage,/LOAD_TIMEOUT_MS=12000/);
 assert.match(memoryPage,/controller\.abort\(\)/);
 assert.match(memoryPage,/signal:controller\.signal/);
 assert.match(memoryPage,/response\.status===404/);
 assert.match(memoryPage,/status==='error'/);
 assert.match(memoryPage,/Try again/);
 assert.match(memoryPage,/RecipientMemoryExperience memory=\{memory\}/);
});

test('owner order detail shows saved keyring front/back artwork and folds technical data',()=>{
 const order=read('app/admin/(protected)/orders/[id]/page.tsx');
 const css=read('app/globals.css');
 assert.match(order,/const frontArtworkUrl = secureArtworkUrl\(productDetails.printArtworkUrl\)/);
 assert.match(order,/const backArtworkUrl = secureArtworkUrl\(productDetails.backArtworkUrl\)/);
 assert.match(order,/Front — Photograph/);
 assert.match(order,/Back — Personalised message/);
 assert.match(order,/Preview front/);
 assert.match(order,/Preview back/);
 assert.match(order,/Download print file/);
 assert.match(order,/<details className="smAdminPersonalisation smAdminTechnicalDetails">/);
 assert.match(css,/\.smAdminPrintGrid/);
});
