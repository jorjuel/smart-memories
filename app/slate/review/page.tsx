'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {loadSlateDraft,storeSlateDraft,clearSlateDraft,type SlateReviewDraft} from '@/lib/slateReviewDraft';
import {paint} from '@/components/SlateSinglePageCustomiser';
import {getGiftStudioConfig,type GiftStudioSlug} from '@/lib/giftStudioProducts';
import {uploadMemoryMedia,readMemorySaveResult} from '@/lib/memoryMediaUpload';
import SmartMemoryLivePreview from '@/components/SmartMemoryLivePreview';

function CoasterReviewThumbnail({file,index,active,reusesFirst,onSelect}:{file:File;index:number;active:boolean;reusesFirst:boolean;onSelect:()=>void}){
 const [src,setSrc]=useState('');
 useEffect(()=>{
  const objectUrl=URL.createObjectURL(file);
  setSrc(objectUrl);
  return()=>URL.revokeObjectURL(objectUrl);
 },[file]);
 return <button type="button" className={active?'smCoasterReviewThumb smCoasterSelected':'smCoasterReviewThumb'}
  aria-label={`Preview coaster ${index+1}${reusesFirst?' (same image as coaster 1)':''}`}
  aria-pressed={active} onClick={onSelect}>
  {src&&<img src={src} alt="" loading="lazy"/>}
  <span>{index+1}</span>
 </button>;
}
export default function SlateReviewPage({productSlug='smart-photo-slate'}:{productSlug?:GiftStudioSlug}){
 const config=getGiftStudioConfig(productSlug);
 if(!config)throw Error('Unsupported gift');
 const [draft,setDraft]=useState<SlateReviewDraft|null>(null);
 const [image,setImage]=useState<HTMLImageElement|null>(null);
 const [selectedReviewCoaster,setSelectedReviewCoaster]=useState(0);
 const [reviewCoasterImage,setReviewCoasterImage]=useState<HTMLImageElement|null>(null);
 const [photoPreviewUrl,setPhotoPreviewUrl]=useState('');
 const [audioUrl,setAudioUrl]=useState('');
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [swappingMainPhoto,setSwappingMainPhoto]=useState(false);
 const [error,setError]=useState('');
 const [success,setSuccess]=useState(false);
 const canvasRef=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  let active=true;
  loadSlateDraft(productSlug).then(data=>{
   if(!active)return;
   setDraft(data);
   if(data){
    const photoUrl=URL.createObjectURL(data.photo);
    const img=new Image();
    img.onload=()=>{if(active){setImage(img);setPhotoPreviewUrl(photoUrl);}else URL.revokeObjectURL(photoUrl);};
    img.onerror=()=>{URL.revokeObjectURL(photoUrl);setError('The photo could not be previewed.');};
    img.src=photoUrl;
    if(data.audio)setAudioUrl(URL.createObjectURL(data.audio));
   }
  }).catch(()=>{if(active)setError('Your saved design could not be loaded. Return to the customiser.');})
    .finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[]);
 useEffect(()=>()=>{if(audioUrl)URL.revokeObjectURL(audioUrl);},[audioUrl]);
 useEffect(()=>()=>{if(photoPreviewUrl)URL.revokeObjectURL(photoPreviewUrl);},[photoPreviewUrl]);
 const size=draft?config.sizes[draft.sizeIndex]||config.sizes[0]:null;
 const coasterCount=productSlug==='coaster-set'&&draft?([1,2,4,6][draft.sizeIndex]||1):1;
 useEffect(()=>{
  if(productSlug!=='coaster-set'||selectedReviewCoaster===0){setReviewCoasterImage(null);return;}
  const file=draft?.extraCoasterPhotos?.[selectedReviewCoaster-1];
  if(!file){setReviewCoasterImage(null);return;}
  const url=URL.createObjectURL(file);let active=true;const img=new Image();
  img.onload=()=>{if(active)setReviewCoasterImage(img);};
  img.onerror=()=>{if(active)setReviewCoasterImage(null);};
  img.src=url;
  return()=>{active=false;URL.revokeObjectURL(url);};
 },[productSlug,selectedReviewCoaster,draft]);
 const dimensions=draft&&size?
  config.directions&&draft.direction==='landscape'&&size.width!==size.height
  ? {...size,width:size.height,height:size.width}:size:null;
 useEffect(()=>{
  if(!draft||!image||!dimensions||!canvasRef.current)return;
  const ctx=canvasRef.current.getContext('2d');
  if(ctx)paint(ctx,productSlug==='coaster-set'&&selectedReviewCoaster>0?reviewCoasterImage||image:image,dimensions,draft.crop,draft.wording,draft.topText,
    draft.bottomText,draft.dedication,900,draft.fit,draft.rotation);
 },[draft,image,reviewCoasterImage,selectedReviewCoaster,productSlug,dimensions?.width,dimensions?.height]);
 async function promoteSelectedCoaster(){
  if(productSlug!=='coaster-set'||!draft||selectedReviewCoaster<1||saving||swappingMainPhoto)return;
  const replacement=draft.extraCoasterPhotos?.[selectedReviewCoaster-1];
  if(!replacement)return;
  const oldMain=draft.photo;
  const newExtras=[...(draft.extraCoasterPhotos||[])];
  newExtras[selectedReviewCoaster-1]=oldMain;
  const updated:SlateReviewDraft={...draft,photo:replacement,extraCoasterPhotos:newExtras};
  setSwappingMainPhoto(true);setError('');
  try{
   const url=URL.createObjectURL(replacement);
   const img=await new Promise<HTMLImageElement>((resolve,reject)=>{
    const candidate=new Image();
    candidate.onload=()=>resolve(candidate);
    candidate.onerror=()=>reject(Error('The selected photograph could not be opened.'));
    candidate.src=url;
   });
   await storeSlateDraft(updated);
   setDraft(updated);setImage(img);setPhotoPreviewUrl(url);
   setSelectedReviewCoaster(0);
  }catch(err){setError(err instanceof Error?err.message:'Could not change the Smart Memory photo.');}
  finally{setSwappingMainPhoto(false);}
 }
 async function addToBasket(){
  if(!draft||draft.productSlug!==productSlug||!image||!size||!dimensions||saving||success)return;
  // Capture validated values locally; nested async functions can safely use these.
  const selectedConfig=config;
  if(!selectedConfig)throw Error('Unsupported gift');
  const printDimensions=dimensions;
  if(!draft.sender.trim()){setError('Please enter your name in the From field before confirming.');return;}
  setSaving(true);setError('');
  try{
   // Slate dimensions are physical cm; other ratios are display proportions until
   // the supplier confirms print dimensions and bleed/safe zones.
   const pixels=productSlug==='smart-photo-slate'
     ?Math.round(dimensions.width/2.54*300)
     :selectedConfig.shape==='keyring'?1800:selectedConfig.shape==='coaster'?2400:3000;
   async function artworkFor(img:HTMLImageElement,index:number):Promise<File>{
     const canvas=document.createElement('canvas');
     const ctx=canvas.getContext('2d');
     if(!ctx)throw Error('Could not create print artwork.');
     paint(ctx,img,printDimensions,draft!.crop,draft!.wording,draft!.topText,draft!.bottomText,
       draft!.dedication,pixels,draft!.fit,draft!.rotation);
     const blob=await new Promise<Blob>((resolve,reject)=>
       canvas.toBlob(b=>b?resolve(b):reject(Error('Could not export the design.')),'image/jpeg',.94));
     return new File([blob],`${productSlug}-print-${index+1}.jpg`,{type:'image/jpeg'});
   }
   const printFiles=[await artworkFor(image,0)];
   if(productSlug==='coaster-set'&&draft.extraCoasterPhotos?.length){
    for(const [index,extra] of draft.extraCoasterPhotos.entries()){
      const picture=await new Promise<HTMLImageElement>((resolve,reject)=>{
        const url=URL.createObjectURL(extra);
        const img=new Image();
        img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};
        img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Could not load a coaster photo.'));};
        img.src=url;
      });
      printFiles.push(await artworkFor(picture,index+1));
    }
   }
   const [originalPath,printPaths,audioPath]=await Promise.all([
     uploadMemoryMedia(draft.photo,'photo'),
     Promise.all(printFiles.map(file=>uploadMemoryMedia(file,'photo'))),
     draft.audio?uploadMemoryMedia(draft.audio,'audio'):Promise.resolve(null)
   ]);
   const printPath=printPaths[0];
   const form=new FormData();
   form.set('photoPath',originalPath);
   if(audioPath)form.set('audioPath',audioPath);
   form.set('recipient',draft.recipient.trim()||'Someone special');
   form.set('sender',draft.sender.trim());
   form.set('message',draft.message.trim());
   const response=await fetch('/api/memories',{method:'POST',body:form});
   const saved=await readMemorySaveResult(response);
   if(!saved.code)throw Error('Smart Memory could not be saved.');
   const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
   if(!base)throw Error('Supabase storage is not configured.');
   const url=(p:string)=>base+'/storage/v1/object/public/memory-media/'+p.split('/').map(encodeURIComponent).join('/');
   const existing=localStorage.getItem('smart-memories-cart');
   const parsed=existing?JSON.parse(existing):[];
   const items=Array.isArray(parsed)?parsed:[];
   items.push({
    id:crypto.randomUUID(),productType:'product',productSlug,
    memoryCode:saved.code,name:selectedConfig.name,
    category:productSlug==='smart-photo-slate'?'Smart Memories':'Personalised Gifts',occasion:draft.occasion||undefined,
    recipient:draft.recipient.trim()||'Someone special',
    design:draft.wording==='none'?'Full photo gift':'Gift with wording',
    imageUrl:url(printPath),audioUrl:audioPath?url(audioPath):null,
    price:selectedConfig.price,quantity:1,
    personalisation:{
     size:size.label,coasterCount:productSlug==='coaster-set'?Number((size.label.match(/\d+/)||['1'])[0]):undefined,
     printAspectWidth:dimensions.width,printAspectHeight:dimensions.height,
     slateOrientation:draft.direction,photoFit:draft.fit,photoRotation:draft.rotation,
     wording:draft.wording,textLayout:draft.wording,
     topText:draft.topText,bottomText:draft.bottomText,paragraph:draft.dedication,
     memoryMessage:draft.message.trim(),sender:draft.sender.trim(),
     printPhotoUrls:productSlug==='coaster-set'
       ?Array.from({length:Number((size.label.match(/\d+/)||['1'])[0])},(_,index)=>url(printPaths[index]||printPaths[0]))
       :[url(originalPath)],
     printArtworkUrl:url(printPath),
     photoZoom:draft.crop.zoom,photoOffsetX:draft.crop.dx,photoOffsetY:draft.crop.dy
    }
   });
   localStorage.setItem('smart-memories-cart',JSON.stringify(items));
   await clearSlateDraft(productSlug).catch(()=>{});
   setSuccess(true);
  }catch(err){
   setError(err instanceof Error?err.message:'Could not save your gift. Please try again.');
  }finally{setSaving(false);}
 }
 if(loading)return <section className="slateStudio"><h1>Preparing your review…</h1></section>;
 if(!draft||draft.productSlug!==productSlug||!size||!dimensions)return <section className="slateStudio"><h1>No gift to review</h1>
  <p>Start by creating your gift on the product page.</p><Link className="btn" href={`/shop/${productSlug}`}>Create a gift</Link></section>;
 return <section className="slateStudio slateReview smWizardPage" aria-label={`Review your ${config.name} and Smart Memory`}>
  <div className="smWizardStepHeading">
   <span>FINAL REVIEW</span>
   <h2>Preview Your Smart Memory</h2>
   <p>See what they'll experience when they tap their gift.</p>
  </div>
  <div className="smWizardDualPreview">
    <article>
     <span className="v14Eyebrow">A. YOUR PHYSICAL GIFT</span>
     <div className="slateFinalArtwork">
     <div className={`slateProductShell slateProductShell--${config.shape} ${config.shape==='slate'?'slateStoneShell':''}`}>
      <canvas ref={canvasRef} width={900} height={1200}
       style={{aspectRatio:String(dimensions.width)+' / '+String(dimensions.height)}}
       aria-label={`Finished ${config.name}`} role="img"/>
     </div>
     </div>
     <p className="slateFinalSize"><strong>{size.label}</strong> · {config.directions?(draft.direction==='landscape'?'Landscape':'Vertical'):'Personalised'}</p>
     {productSlug==='coaster-set'&&<div className="smCoasterReviewGallery">
      <p className="smCoasterReviewGalleryTitle"><strong>Preview all {coasterCount} coasters</strong><span>Tap a photo to see its design above.</span></p>
      <div className="smCoasterReviewThumbnails" role="group" aria-label="Choose coaster to preview">
       {Array.from({length:coasterCount},(_,index)=>{
        const file=index===0?draft.photo:draft.extraCoasterPhotos?.[index-1]||draft.photo;
        return <CoasterReviewThumbnail key={index} file={file} index={index}
         active={selectedReviewCoaster===index} reusesFirst={index>0&&!draft.extraCoasterPhotos?.[index-1]}
         onSelect={()=>setSelectedReviewCoaster(index)}/>;
       })}
      </div>
      <p className="slateHelp" aria-live="polite">Showing coaster {selectedReviewCoaster+1} of {coasterCount}{selectedReviewCoaster>0&&!draft.extraCoasterPhotos?.[selectedReviewCoaster-1]?' · Reusing photo 1':''}.</p>
      <p className="slateHelp"><strong>Photo 1 is your Smart Memory cover photo.</strong> You can make another coaster photo the cover without losing any photo.</p>
      {selectedReviewCoaster>0&&draft.extraCoasterPhotos?.[selectedReviewCoaster-1]&&<button type="button"
       className="btn smCoasterMakeMain" disabled={swappingMainPhoto||saving}
       onClick={()=>void promoteSelectedCoaster()}>
       {swappingMainPhoto?'Updating Smart Memory photo…':`Make coaster ${selectedReviewCoaster+1} the main Smart Memory photo`}
      </button>}
     </div>}
    </article>
    <article>
     <span className="v14Eyebrow">B. THEIR SMART MEMORY</span>
     <SmartMemoryLivePreview
       recipient={draft.recipient.trim()}
       message={draft.message.trim()}
       sender={draft.sender.trim()}
       occasion={draft.occasion}
       photoUrl={photoPreviewUrl}
       audioUrl={audioUrl}
     />
    </article>
  </div>
  <div className="smWizardReviewSummary">
   <div><span>Gift</span><strong>{config.name}</strong></div>
   <div><span>Size</span><strong>{size.label}</strong></div>
   <div><span>Voice</span><strong>{draft.audio?'✓ Added':'Optional'}</strong></div>
   <div><span>Message</span><strong>{draft.message.trim()?'✓ Added':'Optional'}</strong></div>
   <div><span>Price</span><strong>£{config.price.toFixed(2)}</strong></div>
  </div>
  {error&&<p role="alert" className="smWizardError">{error}</p>}
  {success?
   <div className="smWizardSection slateReviewSuccess">
    <h3>Your gift is ready</h3>
    <p>Your gift and Smart Memory have been added to the basket.</p>
    <Link className="btn big smWizardCreateButton" href="/cart">Go to basket</Link>
   </div>:
   <div className="slateReviewFooter">
    <Link className="slateTextButton" href={`/shop/${productSlug}`}>← Edit my gift</Link>
    <button type="button" className="btn big smWizardCreateButton" onClick={()=>void addToBasket()} disabled={saving||!image}>
      {saving?'Saving gift and memory…':'Confirm & add to basket'}
    </button>
   </div>
  }
 </section>;
}
