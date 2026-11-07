'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {loadSlateDraft,clearSlateDraft,type SlateReviewDraft} from '@/lib/slateReviewDraft';
import {paint} from '@/components/SlateSinglePageCustomiser';
import {getGiftStudioConfig,type GiftStudioSlug} from '@/lib/giftStudioProducts';
import {uploadMemoryMedia,readMemorySaveResult} from '@/lib/memoryMediaUpload';
import SmartMemoryLivePreview from '@/components/SmartMemoryLivePreview';

export default function SlateReviewPage({productSlug='smart-photo-slate'}:{productSlug?:GiftStudioSlug}){
 const config=getGiftStudioConfig(productSlug);
 if(!config)throw Error('Unsupported gift');
 const [draft,setDraft]=useState<SlateReviewDraft|null>(null);
 const [image,setImage]=useState<HTMLImageElement|null>(null);
 const [photoPreviewUrl,setPhotoPreviewUrl]=useState('');
 const [audioUrl,setAudioUrl]=useState('');
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
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
 const dimensions=draft&&size?
  config.directions&&draft.direction==='landscape'&&size.width!==size.height
  ? {...size,width:size.height,height:size.width}:size:null;
 useEffect(()=>{
  if(!draft||!image||!dimensions||!canvasRef.current)return;
  const ctx=canvasRef.current.getContext('2d');
  if(ctx)paint(ctx,image,dimensions,draft.crop,draft.wording,draft.topText,
    draft.bottomText,draft.dedication,900,draft.fit,draft.rotation);
 },[draft,image,dimensions?.width,dimensions?.height]);
 async function addToBasket(){
  if(!draft||draft.productSlug!==productSlug||!image||!size||!dimensions||saving||success)return;
  if(!draft.sender.trim()){setError('Please enter your name in the From field before confirming.');return;}
  setSaving(true);setError('');
  try{
   // Slate dimensions are physical cm; other ratios are display proportions until
   // the supplier confirms print dimensions and bleed/safe zones.
   const pixels=productSlug==='smart-photo-slate'
     ?Math.round(dimensions.width/2.54*300)
     :config.shape==='keyring'?1800:config.shape==='coaster'?2400:3000;
   async function artworkFor(img:HTMLImageElement,index:number):Promise<File>{
     const canvas=document.createElement('canvas');
     const ctx=canvas.getContext('2d');
     if(!ctx)throw Error('Could not create print artwork.');
     paint(ctx,img,dimensions,draft!.crop,draft!.wording,draft!.topText,draft!.bottomText,
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
    memoryCode:saved.code,name:config.name,
    category:productSlug==='smart-photo-slate'?'Smart Memories':'Personalised Gifts',occasion:draft.occasion||undefined,
    recipient:draft.recipient.trim()||'Someone special',
    design:draft.wording==='none'?'Full photo gift':'Gift with wording',
    imageUrl:url(printPath),audioUrl:audioPath?url(audioPath):null,
    price:config.price,quantity:1,
    personalisation:{
     size:size.label,printAspectWidth:dimensions.width,printAspectHeight:dimensions.height,
     slateOrientation:draft.direction,photoFit:draft.fit,photoRotation:draft.rotation,
     wording:draft.wording,textLayout:draft.wording,
     topText:draft.topText,bottomText:draft.bottomText,paragraph:draft.dedication,
     memoryMessage:draft.message.trim(),sender:draft.sender.trim(),
     printPhotoUrls:productSlug==='coaster-set'?printPaths.map(url):[url(originalPath)],
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
