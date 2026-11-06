'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {uploadMemoryMedia,readMemorySaveResult} from '@/lib/memoryMediaUpload';

type SlateSize={label:string;width:number;height:number};
const SIZES:SlateSize[]=[
 {label:'14 × 14 cm',width:14,height:14},
 {label:'19 × 19 cm',width:19,height:19},
 {label:'14 × 19 cm',width:14,height:19},
 {label:'19 × 29 cm',width:19,height:29},
];
const OCCASIONS=['Birthday','Wedding','Anniversary','Family Memory','New Baby','Pet Memory','Remembrance','Retirement','Graduation','Christmas','Just Because'];
type Wording='none'|'bottom'|'top'|'both'|'paragraph';
const WAYS:{value:Wording;label:string}[]=[
 {value:'none',label:'Photo only'},
 {value:'bottom',label:'Text below'},
 {value:'top',label:'Text above'},
 {value:'both',label:'Text above + below'},
 {value:'paragraph',label:'Short dedication'},
];
type Crop={zoom:number;dx:number;dy:number};
type PhotoFit='contain'|'cover';
type SlateDirection='portrait'|'landscape';
const PRICE=24.99; // Retain existing slate base price until size-specific prices are configured.

function paint(ctx:CanvasRenderingContext2D,image:HTMLImageElement|undefined,sz:SlateSize,crop:Crop,way:Wording,top:string,bottom:string,dedication:string,cw=900,fit:PhotoFit='contain',rotation=0){
 const ch=Math.round(cw*sz.height/sz.width);
 const canvas=ctx.canvas;canvas.width=cw;canvas.height=ch;
 const w=cw,h=ch;
 ctx.fillStyle='#191919';ctx.fillRect(0,0,w,h);
 // Subtle organic slate edges and an inset white printable face.
 ctx.fillStyle='#f8f8f4';ctx.fillRect(w*.025,h*.018,w*.95,h*.964);
 // No wording: use nearly the whole printable face, without a large white mat.
 const photoOnly=way==='none';
 const inset=photoOnly?w*.027:w*.072;
 const topPadding=photoOnly?h*.026:h*.047;
 const bottomPadding=photoOnly?h*.026:h*.045;
 const fontSize=w*.036;
 ctx.textAlign='center';ctx.fillStyle='#222222';
 const topSpace=(way==='top'||way==='both')?fontSize*2.0:0;
 const bottomSpace=(way==='bottom'||way==='both')?fontSize*2.3:way==='paragraph'?fontSize*4.0:0;
 const px=inset,py=topPadding+topSpace,pw=w-2*inset,ph=h-topPadding-bottomPadding-topSpace-bottomSpace;
 ctx.save();ctx.beginPath();ctx.rect(px,py,pw,ph);ctx.clip();
 if(image){
  // Apply rotation before fitting so portrait and landscape photos keep their full borders.
  const turn=rotation%180!==0;
  const iw=turn?image.naturalHeight:image.naturalWidth;
  const ih=turn?image.naturalWidth:image.naturalHeight;
  const scale=(fit==='cover'?Math.max(pw/iw,ph/ih):Math.min(pw/iw,ph/ih))*crop.zoom;
  const scaledW=iw*scale,scaledH=ih*scale;
  const spareX=(pw-scaledW)/2,spareY=(ph-scaledH)/2;
  // In 'fit' mode, keep the entire image inside the printable area.
  const limitX=Math.abs(spareX),limitY=Math.abs(spareY);
  const shiftX=fit==='contain' && scaledW<=pw?0:Math.max(-limitX,Math.min(limitX,crop.dx*pw/2));
  const shiftY=fit==='contain' && scaledH<=ph?0:Math.max(-limitY,Math.min(limitY,crop.dy*ph/2));
  ctx.save();
  ctx.translate(px+pw/2+shiftX,py+ph/2+shiftY);
  ctx.rotate(rotation*Math.PI/180);
  ctx.drawImage(image,-image.naturalWidth*scale/2,-image.naturalHeight*scale/2,
    image.naturalWidth*scale,image.naturalHeight*scale);
  ctx.restore();
 }else{
  ctx.fillStyle='#e9e9e7';ctx.fillRect(px,py,pw,ph);
  ctx.fillStyle='#777';ctx.font='28px sans-serif';ctx.fillText('YOUR PHOTO',w/2,py+ph/2);
 }
 ctx.restore();
 ctx.fillStyle='#222';ctx.font='italic '+fontSize+'px Georgia, serif';
 if((way==='top'||way==='both')&&top.trim())ctx.fillText(top.slice(0,80),w/2,topPadding+fontSize*.85,w-2*inset);
 if((way==='bottom'||way==='both')&&bottom.trim())ctx.fillText(bottom.slice(0,80),w/2,py+ph+fontSize*1.55,w-2*inset);
 if(way==='paragraph'&&dedication.trim()){
  ctx.font='italic '+fontSize+'px Georgia, serif';
  const words=dedication.trim().split(/\s+/);
  let lines:string[]=[];let line='';
  for(const word of words){
   const next=line?line+' '+word:word;
   if(ctx.measureText(next).width>w-2*inset && line){lines.push(line);line=word;}else line=next;
  }
  if(line)lines.push(line);
  lines=lines.slice(0,3);
  lines.forEach((value,i)=>ctx.fillText(value.slice(0,100),w/2,py+ph+fontSize*(1.15+i*1.1),w-2*inset));
 }
}
export default function SlateSinglePageCustomiser({initialOccasion=''}:{initialOccasion?:string}){
 const [occasion,setOccasion]=useState(initialOccasion);
 const [sizeIndex,setSizeIndex]=useState(2);
 const [direction,setDirection]=useState<SlateDirection>('portrait');
 const [photo,setPhoto]=useState<File|null>(null);
 const [photoUrl,setPhotoUrl]=useState('');
 const [image,setImage]=useState<HTMLImageElement>();
 const [crop,setCrop]=useState<Crop>({zoom:1,dx:0,dy:0});
 const [fit,setFit]=useState<PhotoFit>('contain');
 const [rotation,setRotation]=useState(0);
 const [wording,setWording]=useState<Wording>('bottom');
 const [topText,setTopText]=useState('');
 const [bottomText,setBottomText]=useState('');
 const [dedication,setDedication]=useState('');
 const [message,setMessage]=useState('');
 const [recipient,setRecipient]=useState('');
 const [sender,setSender]=useState('');
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 const [added,setAdded]=useState(false);
 const canvasRef=useRef<HTMLCanvasElement>(null);
 const drag=useRef<{x:number;y:number;dx:number;dy:number}|null>(null);
 const selectedSize=SIZES[sizeIndex];
 const size=direction==='landscape' && selectedSize.width!==selectedSize.height
   ? {...selectedSize,width:selectedSize.height,height:selectedSize.width} : selectedSize;
 const detectedOrientation=image?(Math.abs(image.naturalWidth-image.naturalHeight)/Math.max(image.naturalWidth,image.naturalHeight)<.04?'square':image.naturalWidth>image.naturalHeight?'landscape':'portrait'):null;
 const draw=useCallback(()=>{
  const ctx=canvasRef.current?.getContext('2d');
  if(ctx)paint(ctx,image,size,crop,wording,topText,bottomText,dedication,900,fit,rotation);
 },[image,size,crop,wording,topText,bottomText,dedication,fit,rotation]);
 useEffect(()=>{draw();},[draw]);
 useEffect(()=>()=>{if(photoUrl)URL.revokeObjectURL(photoUrl);},[photoUrl]);

 function choosePhoto(file?:File){
  if(!file)return;
  if(file.size>10*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type)){
   setError('Choose a JPG, PNG or WebP photo no larger than 10MB.');return;
  }
  setError('');setAdded(false);
  const url=URL.createObjectURL(file);
  const img=new Image();img.onload=()=>{setImage(img);setPhoto(file);setPhotoUrl(url);setCrop({zoom:1,dx:0,dy:0});setFit('contain');setRotation(0);};
  img.onerror=()=>{URL.revokeObjectURL(url);setError('That photograph could not be opened.');};
  img.src=url;
 }
 function startDrag(e:React.PointerEvent<HTMLCanvasElement>){
  if(!image)return; e.currentTarget.setPointerCapture(e.pointerId);
  drag.current={x:e.clientX,y:e.clientY,dx:crop.dx,dy:crop.dy};
 }
 function moveDrag(e:React.PointerEvent<HTMLCanvasElement>){
  if(!drag.current)return;
  const rect=e.currentTarget.getBoundingClientRect();
  const px=(e.clientX-drag.current.x)/Math.max(rect.width,1)*2;
  const py=(e.clientY-drag.current.y)/Math.max(rect.height,1)*2;
  setCrop(c=>({...c,dx:Math.max(-2,Math.min(2,drag.current!.dx+px)),
   dy:Math.max(-2,Math.min(2,drag.current!.dy+py))}));
 }
 function stopDrag(){drag.current=null;}
 async function addToBasket(){
  if(!photo||!image){setError('Please upload your photograph first.');return;}
  if(saving)return;
  setSaving(true);setError('');
  try{
   // Render the same composition at approximately 300 DPI for actual slate printing.
   // Preview stays at 900 pixels wide for quick editing and mobile performance.
   const canvas=document.createElement('canvas');
   const printCtx=canvas.getContext('2d');
   if(!printCtx)throw Error('Could not prepare print artwork.');
   paint(printCtx,image,size,crop,wording,topText,bottomText,dedication,Math.round(size.width/2.54*300),fit,rotation);
   const artwork=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Could not export your design.')),'image/jpeg',.94));
   const artworkFile=new File([artwork],'smart-slate-print.jpg',{type:'image/jpeg'});
   const [photoPath,artworkPath]=await Promise.all([
     uploadMemoryMedia(photo,'photo'),
     uploadMemoryMedia(artworkFile,'photo')
   ]);
   const form=new FormData();
   form.set('photoPath',photoPath);
   form.set('recipient',recipient.trim()||'Someone special');
   form.set('sender',sender.trim());
   form.set('message',message.trim()); // Optional; the attached photo makes the memory valid.
   const response=await fetch('/api/memories',{method:'POST',body:form});
   const saved=await readMemorySaveResult(response);
   if(!saved.code)throw Error('The memory was not saved. Please try again.');
   const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
   if(!base)throw Error('Media storage is not configured.');
   const printedUrl=base+'/storage/v1/object/public/memory-media/'+artworkPath.split('/').map(encodeURIComponent).join('/');
   const originalUrl=base+'/storage/v1/object/public/memory-media/'+photoPath.split('/').map(encodeURIComponent).join('/');
   const item={
     id:crypto.randomUUID(),productType:'product',productSlug:'smart-photo-slate',
     memoryCode:saved.code,name:'Personalised Photo Slate',category:'Smart Memories',
     occasion:occasion||undefined,recipient:recipient.trim()||'Someone special',
     design:wording==='none'?'Full photo slate':'Photo slate with wording',imageUrl:printedUrl,price:PRICE,quantity:1,
     personalisation:{
       size:selectedSize.label,slateWidthCm:size.width,slateHeightCm:size.height,slateOrientation:direction,photoFit:fit,photoRotation:rotation,
       wording,textLayout:wording,topText,bottomText,paragraph:dedication,
       memoryMessage:message.trim(),sender:sender.trim(),
       printPhotoUrls:[originalUrl],printArtworkUrl:printedUrl,
       photoZoom:crop.zoom,photoOffsetX:crop.dx,photoOffsetY:crop.dy,
     }
   };
   const stored=localStorage.getItem('smart-memories-cart');
   const parsed=stored?JSON.parse(stored):[];
   const cart=Array.isArray(parsed)?parsed:[];
   cart.push(item);localStorage.setItem('smart-memories-cart',JSON.stringify(cart));
   setAdded(true);
  }catch(err){setError(err instanceof Error?err.message:'Could not save gift. Please try again.');}
  finally{setSaving(false);}
 }
 return <section className="slateStudio" aria-label="Personalise your photo slate">
  <div className="slateStudioHeading"><span className="eyebrow">SMART MEMORIES · PHOTO SLATE</span>
    <h1>Create your personalised slate</h1><p>Choose your size, add a photo and watch your gift come to life.</p></div>
  <div className="slateStudioGrid">
   <div className="slateStudioControls">
    <label>Occasion
     <select value={occasion} onChange={e=>{setOccasion(e.target.value);setAdded(false);}}>
      <option value="">Choose an occasion (optional)</option>
      {OCCASIONS.map(x=><option key={x} value={x}>{x}</option>)}
     </select>
    </label>
    <fieldset><legend>Slate size</legend>
     <div className="slateSizes">{SIZES.map((sz,i)=><button type="button" key={sz.label}
       className={i===sizeIndex?'active':''} aria-pressed={i===sizeIndex}
       onClick={()=>{setSizeIndex(i);setAdded(false);}}>{sz.label}</button>)}</div>
     {selectedSize.width!==selectedSize.height&&<div className="slateOrientationSelector" role="group" aria-label="Slate direction">
       <span>Slate direction</span>
       <div className="slateSizes">
        <button type="button" className={direction==='portrait'?'active':''} aria-pressed={direction==='portrait'}
         onClick={()=>{setDirection('portrait');setAdded(false);}}>Vertical</button>
        <button type="button" className={direction==='landscape'?'active':''} aria-pressed={direction==='landscape'}
         onClick={()=>{setDirection('landscape');setAdded(false);}}>Landscape</button>
       </div>
      </div>}
    </fieldset>
    <label>Upload your photo
     <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>choosePhoto(e.currentTarget.files?.[0])}/>
    </label>
    {photo&&<fieldset><legend>Adjust photo (optional)</legend>
      <p className="slateHelp">Detected photo: {detectedOrientation}. Your image is automatically fitted to the selected slate size.</p>
      <div className="slateOrientationSelector" role="group" aria-label="Photo fitting">
       <span>How should your photo fit?</span>
       <div className="slateSizes">
        <button type="button" className={fit==='contain'?'active':''} aria-pressed={fit==='contain'}
          onClick={()=>{setFit('contain');setCrop({zoom:1,dx:0,dy:0});setAdded(false);}}>Fit whole photo</button>
        <button type="button" className={fit==='cover'?'active':''} aria-pressed={fit==='cover'}
          onClick={()=>{setFit('cover');setCrop({zoom:1,dx:0,dy:0});setAdded(false);}}>Fill area (may crop)</button>
       </div>
      </div>
      <div className="slateOrientationSelector" role="group" aria-label="Rotate photo">
       <span>Photo direction</span>
       <div className="slateSizes">
        <button type="button" onClick={()=>{setRotation(r=>(r+270)%360);setCrop({zoom:1,dx:0,dy:0});setAdded(false);}}>↶ Rotate left</button>
        <button type="button" onClick={()=>{setRotation(r=>(r+90)%360);setCrop({zoom:1,dx:0,dy:0});setAdded(false);}}>↷ Rotate right</button>
       </div>
      </div>
      <label>Zoom <input type="range" min="1" max="3" step=".05" value={crop.zoom}
       onChange={e=>{setCrop(c=>({...c,zoom:Number(e.target.value)}));setAdded(false);}}/></label>
      <p className="slateHelp">Fit whole photo keeps existing photo borders visible. Fill area crops edges only if needed. Drag to reposition when zoomed in.</p>
      <button type="button" className="slateTextButton" onClick={()=>{setCrop({zoom:1,dx:0,dy:0});setAdded(false);}}>Reset photo position</button>
    </fieldset>}
    <fieldset><legend>Wording on your slate</legend>
     <div className="slateWording">{WAYS.map(x=><button type="button" key={x.value}
       className={wording===x.value?'active':''} aria-pressed={wording===x.value}
       onClick={()=>{setWording(x.value);setAdded(false);}}>{x.label}</button>)}</div>
     {(wording==='top'||wording==='both')&&<label>Top words
       <input maxLength={80} value={topText} placeholder="Happy Anniversary" onChange={e=>{setTopText(e.target.value);setAdded(false);}}/></label>}
     {(wording==='bottom'||wording==='both')&&<label>Bottom words
       <input maxLength={80} value={bottomText} placeholder="Love you always" onChange={e=>{setBottomText(e.target.value);setAdded(false);}}/></label>}
     {wording==='paragraph'&&<label>Dedication
       <textarea rows={3} maxLength={160} value={dedication} placeholder="A special moment to remember" onChange={e=>{setDedication(e.target.value);setAdded(false);}}/></label>}
    </fieldset>
    <label>Smart Memory message (optional)
     <textarea rows={3} value={message} maxLength={1500} onChange={e=>{setMessage(e.target.value);setAdded(false);}} placeholder="Add a message to open when someone taps the gift, or leave blank."/>
    </label>
    <div className="slatePersonFields">
     <label>Recipient's name (optional)<input value={recipient} maxLength={100} onChange={e=>{setRecipient(e.target.value);setAdded(false);}}/></label>
     <label>From (optional)<input value={sender} maxLength={100} onChange={e=>{setSender(e.target.value);setAdded(false);}}/></label>
    </div>
   </div>
   <aside className="slateStudioPreview">
    <h2>Your live preview</h2>
    <p className="slateHelp">Photo only uses almost the full slate. If your photo has its own frame, choose Fit whole photo to keep every edge.</p>
    <div className="slatePreviewWrap">
      <canvas ref={canvasRef} width={900} height={1200} style={{aspectRatio:String(size.width)+' / '+String(size.height)}}
       onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={stopDrag} onPointerCancel={stopDrag}
       aria-label="Live personalised slate preview" role="img"/>
    </div>
    <p><strong>{selectedSize.label}</strong> · {direction==='landscape'?'Landscape':'Vertical'} · £{PRICE.toFixed(2)}</p>
    <button type="button" className="btn big" onClick={()=>void addToBasket()} disabled={saving||!photo}>
      {saving?'Saving your gift…':'Add personalised slate to basket'}
    </button>
    {error&&<p role="alert" className="slateError">{error}</p>}
    {added&&<p role="status" className="slateSuccess">Added to your basket. <Link href="/cart">Review basket</Link> or make more changes above.</p>}
    <small>Price uses the current slate base price for every size until size-specific pricing is configured.</small>
   </aside>
  </div>
 </section>;
}
