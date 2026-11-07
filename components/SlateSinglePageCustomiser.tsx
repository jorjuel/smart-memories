'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import {storeSlateDraft,loadSlateDraft} from '@/lib/slateReviewDraft';
import type {SlateReviewDraft} from '@/lib/slateReviewDraft';
import {getGiftStudioConfig,type GiftStudioSlug} from '@/lib/giftStudioProducts';

type SlateSize={label:string;width:number;height:number};
export const SIZES:SlateSize[]=[
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
export const PRICE=24.99; // Retain existing slate base price until size-specific prices are configured.

export function paint(ctx:CanvasRenderingContext2D,image:HTMLImageElement|undefined,sz:SlateSize,crop:Crop,way:Wording,top:string,bottom:string,dedication:string,cw=900,fit:PhotoFit='contain',rotation=0){
 const ch=Math.round(cw*sz.height/sz.width);
 const canvas=ctx.canvas;canvas.width=cw;canvas.height=ch;
 const w=cw,h=ch;
 // Keep the print artwork as a white sublimation face. The rough black
 // stone edge is a separate CSS mockup, never baked into the print file.
 ctx.fillStyle='#f8f8f4';ctx.fillRect(0,0,w,h);
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
function CoasterPhotoThumbnail({file,label}:{file:File;label:string}){
 const [url,setUrl]=useState('');
 useEffect(()=>{const u=URL.createObjectURL(file);setUrl(u);return()=>URL.revokeObjectURL(u);},[file]);
 return <div className="smCoasterPhotoItem">{url&&<img src={url} alt={label} className="smCoasterThumbnail"/>}<div><strong>{label}</strong><small>{file.name}</small></div></div>;
}
export default function SlateSinglePageCustomiser({initialOccasion='',productSlug='smart-photo-slate'}:{initialOccasion?:string;productSlug?:GiftStudioSlug}){
 const config=getGiftStudioConfig(productSlug);
 if(!config)throw Error('Unsupported gift');
 const [occasion,setOccasion]=useState(initialOccasion);
 const [sizeIndex,setSizeIndex]=useState(productSlug==='smart-photo-slate'?2:0);
 const [direction,setDirection]=useState<SlateDirection>('portrait');
 const [photo,setPhoto]=useState<File|null>(null);
 const [extraCoasterPhotos,setExtraCoasterPhotos]=useState<File[]>([]);
 const [selectedCoaster,setSelectedCoaster]=useState(0);
 const [coasterPreviewImage,setCoasterPreviewImage]=useState<HTMLImageElement>();
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
 const [audio,setAudio]=useState<Blob|null>(null);
 const [audioUrl,setAudioUrl]=useState('');
 const [recording,setRecording]=useState(false);
 const [recordingStatus,setRecordingStatus]=useState('');
 const recorderRef=useRef<MediaRecorder|null>(null);
 const chunksRef=useRef<Blob[]>([]);
 const [recipient,setRecipient]=useState('');
 const [sender,setSender]=useState('');
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 const [added,setAdded]=useState(false);
 const canvasRef=useRef<HTMLCanvasElement>(null);
 const drag=useRef<{x:number;y:number;dx:number;dy:number}|null>(null);
 const selectedSize=config.sizes[sizeIndex]||config.sizes[0];
 const coasterCount=productSlug==='coaster-set'?([1,2,4,6][sizeIndex]||1):1;
 const size=config.directions && direction==='landscape' && selectedSize.width!==selectedSize.height
   ? {...selectedSize,width:selectedSize.height,height:selectedSize.width} : selectedSize;
 const detectedOrientation=image?(Math.abs(image.naturalWidth-image.naturalHeight)/Math.max(image.naturalWidth,image.naturalHeight)<.04?'square':image.naturalWidth>image.naturalHeight?'landscape':'portrait'):null;
 const draw=useCallback(()=>{
  const ctx=canvasRef.current?.getContext('2d');
  if(ctx)paint(ctx,productSlug==='coaster-set'&&selectedCoaster>0?coasterPreviewImage||image:image,size,crop,wording,topText,bottomText,dedication,900,fit,rotation);
 },[image,coasterPreviewImage,selectedCoaster,productSlug,size,crop,wording,topText,bottomText,dedication,fit,rotation]);
 useEffect(()=>{draw();},[draw]);
 useEffect(()=>()=>{if(photoUrl)URL.revokeObjectURL(photoUrl);},[photoUrl]);
 useEffect(()=>{
  if(productSlug!=='coaster-set'||selectedCoaster===0){setCoasterPreviewImage(undefined);return;}
  const chosen=extraCoasterPhotos[selectedCoaster-1];
  if(!chosen){setCoasterPreviewImage(undefined);return;}
  let active=true;const url=URL.createObjectURL(chosen);const img=new Image();
  img.onload=()=>{if(active)setCoasterPreviewImage(img);};
  img.onerror=()=>{if(active){setCoasterPreviewImage(undefined);setError('Could not preview this coaster photo.');}};
  img.src=url;
  return()=>{active=false;URL.revokeObjectURL(url);};
 },[productSlug,selectedCoaster,extraCoasterPhotos]);

 function choosePhotos(files:FileList|null){
  if(!files?.length)return;
  choosePhoto(files[0]);
  if(productSlug==='coaster-set'){
    const count=coasterCount;
    const extras=Array.from(files).slice(1,count);
    if(extras.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>10*1024*1024)){
      setError('Choose JPG, PNG or WebP photos no larger than 10MB.');return;
    }
    setExtraCoasterPhotos(extras);
    setSelectedCoaster(0);
  }
 }
 function addCoasterPhoto(file?:File){
  if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){
   setError('Choose a JPG, PNG or WebP photo no larger than 10MB.');return;
  }
  const count=coasterCount;
  setExtraCoasterPhotos(old=>old.length>=count-1?old:[...old,file]);
  setSelectedCoaster(Math.min(extraCoasterPhotos.length+1,count-1));
  setError('');setAdded(false);
 }
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
 async function startRecording(){
  if(recording)return;
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){
    setError('Voice recording is not supported in this browser. Please upload an audio recording instead.');return;
  }
  setError('');setRecordingStatus('');
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    const recorder=new MediaRecorder(stream);
    chunksRef.current=[];
    recorder.ondataavailable=e=>{if(e.data.size)chunksRef.current.push(e.data);};
    recorder.onerror=()=>setError('Recording failed. Please try again.');
    recorder.onstop=()=>{
      stream.getTracks().forEach(track=>track.stop());
      const blob=new Blob(chunksRef.current,{type:recorder.mimeType||'audio/webm'});
      if(blob.size>0&&blob.size<=25*1024*1024){
        if(audioUrl)URL.revokeObjectURL(audioUrl);
        setAudio(blob);setAudioUrl(URL.createObjectURL(blob));
        setRecordingStatus('Voice message recorded. Play it below.');
        setAdded(false);
      }else setError('The recording is empty or larger than 25MB.');
      recorderRef.current=null;
      setRecording(false);
    };
    recorderRef.current=recorder;
    recorder.start();setRecording(true);setRecordingStatus('Recording…');
  }catch{setError('Microphone permission was not granted. You can upload a recording instead.');}
 }
 function stopRecording(){if(recorderRef.current?.state==='recording')recorderRef.current.stop();}
 function chooseAudio(file?:File){
  if(!file)return;
  if(file.size>25*1024*1024 || !file.type.startsWith('audio/')){
    setError('Choose an audio recording smaller than 25MB.');return;
  }
  if(audioUrl)URL.revokeObjectURL(audioUrl);
  setAudio(file);setAudioUrl(URL.createObjectURL(file));setRecordingStatus('Audio message selected.');setAdded(false);setError('');
 }
 useEffect(()=>()=>{
   if(recorderRef.current?.state==='recording')recorderRef.current.stop();
 },[]);
 useEffect(()=>{
   let alive=true;
   loadSlateDraft(productSlug).then(saved=>{
    if(!alive||!saved)return;
    setOccasion(saved.occasion);setSizeIndex(saved.sizeIndex);setDirection(saved.direction);
    setExtraCoasterPhotos(saved.extraCoasterPhotos||[]);setSelectedCoaster(0);
    setCrop(saved.crop);setFit(saved.fit);setRotation(saved.rotation);setWording(saved.wording);
    setTopText(saved.topText);setBottomText(saved.bottomText);setDedication(saved.dedication);
    setMessage(saved.message);setRecipient(saved.recipient);setSender(saved.sender);
    const url=URL.createObjectURL(saved.photo);
    const img=new Image();
    img.onload=()=>{
      if(alive){setPhoto(saved.photo);setPhotoUrl(url);setImage(img);}else URL.revokeObjectURL(url);
    };
    img.onerror=()=>URL.revokeObjectURL(url);
    img.src=url;
    if(saved.audio){const sound=URL.createObjectURL(saved.audio);setAudio(saved.audio);setAudioUrl(sound);}
   }).catch(()=>{});
   return()=>{alive=false;};
 },[]);
 useEffect(()=>()=>{if(audioUrl)URL.revokeObjectURL(audioUrl);},[audioUrl]);
 async function confirmDesign(){
  if(!photo||!image){setError('Please upload your photograph first.');return;}
  if(recording){setError('Stop the voice recording before reviewing.');return;}
  if(!sender.trim()){setError('Please enter your name in the From field.');return;}
  if(saving)return;
  setSaving(true);setError('');
  try{
   const draft:SlateReviewDraft={productSlug,photo,extraCoasterPhotos:extraCoasterPhotos.slice(0,Math.max(0,coasterCount-1)),audio,sizeIndex,direction,crop,fit,rotation,wording,
    occasion,topText,bottomText,dedication,message,recipient,sender};
   await storeSlateDraft(draft);
   window.location.assign(productSlug==='smart-photo-slate'?'/slate/review':`/gift/review/${productSlug}`);
  }catch(err){setError(err instanceof Error?err.message:'Could not prepare the review.');setSaving(false);}
 }
 return <section className="slateStudio smWizardPage" aria-label={`Personalise your ${config.name}`}>
  <div className="slateStudioHeading smWizardStepHeading"><span>CREATE YOUR SMART MEMORY</span>
    <h2>Design Your {config.name}</h2><p>Add your photo, wording and the Smart Memory they will experience when they tap your gift.</p></div>
  <div className="slateStudioGrid">
   <div className="slateStudioControls smWizardFields">
    <label>Occasion
     <select value={occasion} onChange={e=>{setOccasion(e.target.value);setAdded(false);}}>
      <option value="">Choose an occasion (optional)</option>
      {OCCASIONS.map(x=><option key={x} value={x}>{x}</option>)}
     </select>
    </label>
    <fieldset><legend>{config.label} {config.sizes.length>1?'options':'size'}</legend>
     <div className="slateSizes">{config.sizes.map((sz,i)=><button type="button" key={sz.label}
       className={i===sizeIndex?'active':''} aria-pressed={i===sizeIndex}
       onClick={()=>{setSizeIndex(i);setSelectedCoaster(0);setAdded(false);}}>{sz.label}</button>)}</div>
     {config.directions&&selectedSize.width!==selectedSize.height&&<div className="slateOrientationSelector" role="group" aria-label="Slate direction">
       <span>Slate direction</span>
       <div className="slateSizes">
        <button type="button" className={direction==='portrait'?'active':''} aria-pressed={direction==='portrait'}
         onClick={()=>{setDirection('portrait');setAdded(false);}}>Vertical</button>
        <button type="button" className={direction==='landscape'?'active':''} aria-pressed={direction==='landscape'}
         onClick={()=>{setDirection('landscape');setAdded(false);}}>Landscape</button>
       </div>
      </div>}
    </fieldset>
    <label>{productSlug==='coaster-set'?'Upload photo for coaster 1':'Upload your photo'}
     <input type="file" multiple={productSlug==='coaster-set'} accept="image/png,image/jpeg,image/webp" onChange={e=>{choosePhotos(e.currentTarget.files);e.currentTarget.value='';}}/>
    </label>
    {productSlug==='coaster-set'&&photo&&<div className="smCoasterPhotoPicker">
     <p className="slateHelp"><strong>{Math.min(1+extraCoasterPhotos.length,coasterCount)} of {coasterCount} photos selected.</strong> Choose a coaster below to see its actual design in the large preview.</p>
     <div className="smCoasterPhotoList">
      {Array.from({length:coasterCount},(_,index)=>{
       const file=index===0?photo:extraCoasterPhotos[index-1];
       const canUpload=index>0&&index<=extraCoasterPhotos.length+1;
       return <div className="smCoasterExtraRow" key={index}>
        <button type="button" className={selectedCoaster===index?'smCoasterSelected':''} onClick={()=>setSelectedCoaster(index)} aria-pressed={selectedCoaster===index}>
         {file?<CoasterPhotoThumbnail file={file} label={`Coaster ${index+1}`}/>:<strong>Coaster {index+1} · Uses photo 1 until changed</strong>}
        </button>
        {index>0&&<label>{file?`Replace photo ${index+1}`:`+ Add photo for coaster ${index+1}`}
         <input type="file" accept="image/png,image/jpeg,image/webp" disabled={!canUpload} onChange={event=>{
          const replacement=event.currentTarget.files?.[0];
          if(replacement){
           if(replacement.size>10*1024*1024||!['image/jpeg','image/png','image/webp'].includes(replacement.type))setError('Choose a JPG, PNG or WebP photo no larger than 10MB.');
           else{setExtraCoasterPhotos(previous=>{const next=previous.slice(0,coasterCount-1);if(index-1<next.length)next[index-1]=replacement;else if(index-1===next.length)next.push(replacement);return next;});setSelectedCoaster(index);setError('');setAdded(false);}
          }
          event.currentTarget.value='';
         }}/>
        </label>}
        {index>0&&file&&<button type="button" className="slateTextButton" onClick={()=>{setExtraCoasterPhotos(previous=>previous.slice(0,index-1));setSelectedCoaster(0);setAdded(false);}}>Remove from coaster {index+1}</button>}
       </div>;
      })}
     </div>
     <small>The main preview follows the coaster you select. Print artwork for each uploaded photograph is saved with the set.</small>
    </div>}
    {photo&&<fieldset><legend>Adjust photo (optional)</legend>
      <p className="slateHelp">Detected photo: {detectedOrientation}. Your image is automatically fitted to the selected product.</p>
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
    <fieldset><legend>Wording on your {config.label.toLowerCase()}</legend>
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
    <label><strong>Written message <span className="slateOptional">(optional)</span></strong>
     <textarea rows={3} value={message} maxLength={1500} onChange={e=>{setMessage(e.target.value);setAdded(false);}} placeholder="Add a few words if you wish…"/>
    </label>
    <fieldset className="slateVoiceCard smWizardVoiceCard"><legend>Voice message</legend>
      <p className="slateHelp">Record a message that plays when the recipient opens their Smart Memory, or upload an audio recording.</p>
      <div className="slateSizes">
       {!recording?<button type="button" onClick={()=>void startRecording()}>● Record My Voice</button>
         :<button type="button" onClick={stopRecording}>■ Stop Recording</button>}
       {audio&&<button type="button" onClick={()=>{
         if(audioUrl)URL.revokeObjectURL(audioUrl);
         setAudio(null);setAudioUrl('');setRecordingStatus('Recording removed.');
       }}>Remove audio</button>}
      </div>
      <label><strong>Or upload audio</strong><input type="file" accept="audio/*" disabled={recording}
       onChange={e=>{chooseAudio(e.currentTarget.files?.[0]);e.currentTarget.value='';}}/></label>
      {recordingStatus&&<p role="status" className="slateHelp">{recordingStatus}</p>}
      {audioUrl&&<audio src={audioUrl} controls preload="metadata" style={{width:'100%'}}/>}
    </fieldset>
    <p className="slateHelp">Your photo, voice recording or written message can tell the story. Leave the written message blank if you prefer.</p>
    <div className="slatePersonFields smWizardFields">
     <label>Recipient name<input value={recipient} placeholder="e.g. Sarah" maxLength={100} onChange={e=>{setRecipient(e.target.value);setAdded(false);}}/></label>
     <label>From<input required aria-required="true" value={sender} placeholder="e.g. Leo" maxLength={100} onChange={e=>{setSender(e.target.value);setAdded(false);}}/></label>
    </div>
   </div>
   <aside className="slateStudioPreview">
    <span className="v14Eyebrow">A. YOUR PHYSICAL GIFT</span><h2>{productSlug==='coaster-set'?`Your live preview · Coaster ${selectedCoaster+1}`:'Your live preview'}</h2>
    <p className="slateHelp">Photo only uses the printable area. Choose Fit whole photo to preserve the edges of your image.</p>
    <div className="slatePreviewWrap">
     <div className={`slateProductShell slateProductShell--${config.shape} ${config.shape==='slate'?'slateStoneShell':''}`}>
      <canvas ref={canvasRef} width={900} height={1200} style={{aspectRatio:String(size.width)+' / '+String(size.height)}}
       onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={stopDrag} onPointerCancel={stopDrag}
       aria-label={`Live personalised ${config.label.toLowerCase()} preview`} role="img"/>
     </div>
    </div>
    <p><strong>{selectedSize.label}</strong> · {config.directions?(direction==='landscape'?'Landscape':'Vertical'):'Personalised'} · £{config.price.toFixed(2)}</p>
    <button type="button" className="btn big" onClick={()=>void confirmDesign()} disabled={saving||!photo||recording}>
      {saving?'Preparing review…':'Confirm design & review Smart Memory'}
    </button>
    {error&&<p role="alert" className="slateError">{error}</p>}

    <small>Preview is illustrative. Confirm the physical print dimensions and safe area before production.</small>
   </aside>
  </div>
 </section>;
}
