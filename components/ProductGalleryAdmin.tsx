'use client';
import {useEffect,useState} from 'react';
import {compressProductImage} from '@/lib/productImages';
type Photo={path:string;url:string};
export default function ProductGallery({slug}:{slug:string}){
 const [photos,setPhotos]=useState<Photo[]>([]);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 async function reload(){
  const r=await fetch('/api/admin-product-gallery?slug='+encodeURIComponent(slug),{cache:'no-store'});
  const data=await r.json();if(!r.ok)throw Error(data.error||'Unable to load');
  setPhotos(data.photos||[]);
 }
 useEffect(()=>{void reload().catch(e=>setMessage(e.message));},[slug]);
 async function send(method:'PATCH'|'DELETE',path:string){
  if(method==='DELETE'&&!window.confirm('Remove this gallery image?'))return;
  setBusy(true);setMessage('');
  try{
   const r=await fetch('/api/admin-product-gallery',{method,headers:{'Content-Type':'application/json'},body:JSON.stringify({slug,path})});
   const data=await r.json();if(!r.ok)throw Error(data.error||'Could not change photo');
   await reload();window.dispatchEvent(new Event('sm-product-image-updated'));
   setMessage(method==='PATCH'?'Main shop photograph changed.':'Gallery photograph removed.');
  }catch(e){setMessage(e instanceof Error?e.message:'Unable to save');}finally{setBusy(false);}
 }
 async function upload(raw?:File){
  if(!raw)return;setBusy(true);setMessage('');
  try{
   const image=await compressProductImage(raw);const form=new FormData();
   form.set('slug',slug);form.set('file',image,slug+'.jpg');
   const r=await fetch('/api/admin-product-gallery',{method:'POST',body:form});
   const data=await r.json();if(!r.ok)throw Error(data.error||'Unable to upload');
   await reload();setMessage('New gallery image uploaded.');
  }catch(e){setMessage(e instanceof Error?e.message:'Unable to upload');}finally{setBusy(false);}
 }
 return <div style={{marginTop:14}}>
  <strong>Additional photographs ({photos.length})</strong>
  <p style={{fontSize:13}}>Upload alternative product views and choose any as the main shop photo.</p>
  <label className="btn small uploadBtn">{busy?'Saving…':'Add gallery photo'}
   <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy}
    onChange={e=>{void upload(e.target.files?.[0]);e.currentTarget.value='';}} />
  </label>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',gap:10,marginTop:12}}>
   {photos.map(p=><div key={p.path} style={{display:'grid',gap:5}}>
    <img src={p.url} alt="Product gallery" style={{width:'100%',aspectRatio:'1',objectFit:'cover',borderRadius:8}}/>
    <button type="button" className="btn small" disabled={busy} onClick={()=>void send('PATCH',p.path)}>Make main</button>
    <button type="button" className="danger smallAction" disabled={busy} onClick={()=>void send('DELETE',p.path)}>Remove</button>
   </div>)}
  </div>
  {message&&<p role="status" style={{fontSize:13}}>{message}</p>}
 </div>;
}
