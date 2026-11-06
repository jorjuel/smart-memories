'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {loadSlateDraft,clearSlateDraft,type SlateReviewDraft} from '@/lib/slateReviewDraft';
import {SIZES,PRICE,paint} from '@/components/SlateSinglePageCustomiser';
import {uploadMemoryMedia,readMemorySaveResult} from '@/lib/memoryMediaUpload';

export default function SlateReviewPage(){
 const [draft,setDraft]=useState<SlateReviewDraft|null>(null);
 const [image,setImage]=useState<HTMLImageElement|null>(null);
 const [audioUrl,setAudioUrl]=useState('');
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 const [success,setSuccess]=useState(false);
 const canvasRef=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  let active=true;
  loadSlateDraft().then(data=>{
   if(!active)return;
   setDraft(data);
   if(data){
    const photoUrl=URL.createObjectURL(data.photo);
    const img=new Image();
    img.onload=()=>{if(active)setImage(img);URL.revokeObjectURL(photoUrl);};
    img.onerror=()=>{URL.revokeObjectURL(photoUrl);setError('The photo could not be previewed.');};
    img.src=photoUrl;
    if(data.audio)setAudioUrl(URL.createObjectURL(data.audio));
   }
  }).catch(()=>{if(active)setError('Your saved design could not be loaded. Return to the customiser.');})
    .finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[]);
 useEffect(()=>()=>{if(audioUrl)URL.revokeObjectURL(audioUrl);},[audioUrl]);
 const size=draft?SIZES[draft.sizeIndex]:null;
 const dimensions=draft&&size?
  draft.direction==='landscape'&&size.width!==size.height
  ? {...size,width:size.height,height:size.width}:size:null;
 useEffect(()=>{
  if(!draft||!image||!dimensions||!canvasRef.current)return;
  const ctx=canvasRef.current.getContext('2d');
  if(ctx)paint(ctx,image,dimensions,draft.crop,draft.wording,draft.topText,
    draft.bottomText,draft.dedication,900,draft.fit,draft.rotation);
 },[draft,image,dimensions?.width,dimensions?.height]);
 async function addToBasket(){
  if(!draft||!image||!size||!dimensions||saving||success)return;
  setSaving(true);setError('');
  try{
   const canvas=document.createElement('canvas');
   const ctx=canvas.getContext('2d');
   if(!ctx)throw Error('Could not create print artwork.');
   paint(ctx,image,dimensions,draft.crop,draft.wording,draft.topText,draft.bottomText,
    draft.dedication,Math.round(dimensions.width/2.54*300),draft.fit,draft.rotation);
   const blob=await new Promise<Blob>((resolve,reject)=>
    canvas.toBlob(b=>b?resolve(b):reject(Error('Could not export the design.')),'image/jpeg',.94));
   const printFile=new File([blob],'smart-slate-print.jpg',{type:'image/jpeg'});
   // Store original photo for the NFC memory, and the completed design for fulfilment.
   const [originalPath,printPath,audioPath]=await Promise.all([
    uploadMemoryMedia(draft.photo,'photo'),
    uploadMemoryMedia(printFile,'photo'),
    draft.audio?uploadMemoryMedia(draft.audio,'audio'):Promise.resolve(null)
   ]);
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
    id:crypto.randomUUID(),productType:'product',productSlug:'smart-photo-slate',
    memoryCode:saved.code,name:'Personalised Photo Slate',
    category:'Smart Memories',occasion:draft.occasion||undefined,
    recipient:draft.recipient.trim()||'Someone special',
    design:draft.wording==='none'?'Full photo slate':'Slate with wording',
    imageUrl:url(printPath),audioUrl:audioPath?url(audioPath):null,
    price:PRICE,quantity:1,
    personalisation:{
     size:size.label,slateWidthCm:dimensions.width,slateHeightCm:dimensions.height,
     slateOrientation:draft.direction,photoFit:draft.fit,photoRotation:draft.rotation,
     wording:draft.wording,textLayout:draft.wording,
     topText:draft.topText,bottomText:draft.bottomText,paragraph:draft.dedication,
     memoryMessage:draft.message.trim(),sender:draft.sender.trim(),
     printPhotoUrls:[url(originalPath)],printArtworkUrl:url(printPath),
     photoZoom:draft.crop.zoom,photoOffsetX:draft.crop.dx,photoOffsetY:draft.crop.dy
    }
   });
   localStorage.setItem('smart-memories-cart',JSON.stringify(items));
   await clearSlateDraft().catch(()=>{});
   setSuccess(true);
  }catch(err){
   setError(err instanceof Error?err.message:'Could not save your gift. Please try again.');
  }finally{setSaving(false);}
 }
 if(loading)return <section className="slateStudio"><h1>Preparing your review…</h1></section>;
 if(!draft||!size||!dimensions)return <section className="slateStudio"><h1>No slate to review</h1>
  <p>Start by creating your slate on the product page.</p><Link className="btn" href="/shop/smart-photo-slate">Create a slate</Link></section>;
 return <section className="slateStudio slateReview" aria-label="Review your slate and Smart Memory">
  <div className="slateStudioHeading"><span className="eyebrow">SMART MEMORIES · FINAL REVIEW</span>
   <h1>Your slate and Smart Memory</h1>
   <p>Check the physical gift and the message your recipient will see when they tap it.</p>
  </div>
  <div className="slateStudioGrid">
   <div className="slateStudioPreview">
    <h2>Your finished slate</h2>
    <div className="slatePreviewWrap">
     <canvas ref={canvasRef} width={900} height={1200}
      style={{aspectRatio:String(dimensions.width)+' / '+String(dimensions.height)}}
      aria-label="Finished personalised photo slate" role="img"/>
    </div>
    <p><strong>{size.label}</strong> · {draft.direction==='landscape'?'Landscape':'Vertical'} · £{PRICE.toFixed(2)}</p>
   </div>
   <div className="slateStudioControls">
    <div className="card">
     <h2>What opens when they tap the gift</h2>
     <p><strong>For:</strong> {draft.recipient.trim()||'Someone special'}</p>
     {draft.message.trim()?<p className="slateReviewMessage">{draft.message}</p>:
       <p className="slateHelp">No written message added. The recipient will still see their photograph.</p>}
     {audioUrl&&<div><h3>Voice message</h3><audio src={audioUrl} controls preload="metadata" style={{width:'100%'}}/></div>}
     {draft.sender.trim()&&<p><strong>From:</strong> {draft.sender}</p>}
    </div>
    {error&&<p role="alert" className="slateError">{error}</p>}
    {success?<div className="card"><p className="slateSuccess">Your slate and Smart Memory have been added to the basket.</p>
       <Link className="btn big" href="/cart">Go to basket</Link></div>:
      <div className="card slateReviewActions">
       <Link className="btn secondary" href="/shop/smart-photo-slate">Edit my gift</Link>
       <button type="button" className="btn big" onClick={()=>void addToBasket()} disabled={saving||!image}>
        {saving?'Saving gift and memory…':'Confirm & add to basket'}
       </button>
      </div>}
   </div>
  </div>
 </section>;
}
