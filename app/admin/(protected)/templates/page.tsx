'use client';
import {useEffect,useState} from 'react';
import {products} from '@/lib/products';
type Frame={id:string;name:string;productSlugs:string[];orientation:string;url:string;published:boolean;sortOrder:number};
export default function FrameStudio(){
 const [frames,setFrames]=useState<Frame[]>([]);
 const [name,setName]=useState('');
 const [orientation,setOrientation]=useState('portrait');
 const [selected,setSelected]=useState<string[]>(['smart-photo-slate']);
 const [file,setFile]=useState<File|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 async function refresh(){
  const r=await fetch('/api/admin-frame-templates?all=1',{cache:'no-store'});
  const data=await r.json();if(!r.ok) throw Error(data.error||'Could not load templates');
  setFrames(data.templates||[]);
 }
 useEffect(()=>{void refresh().catch(e=>setMessage(e.message));},[]);
 async function create(e:React.FormEvent){
  e.preventDefault();if(!file) return setMessage('Choose a transparent PNG or WebP image.');
  setBusy(true);setMessage('');
  try{
   const form=new FormData();form.set('file',file);form.set('name',name);
   form.set('orientation',orientation);form.set('productSlugs',JSON.stringify(selected));
   const r=await fetch('/api/admin-frame-templates',{method:'POST',body:form});
   const data=await r.json();if(!r.ok) throw Error(data.error||'Upload failed');
   setName('');setFile(null);
   const input=document.getElementById('frame-upload') as HTMLInputElement|null;if(input)input.value='';
   await refresh();setMessage('Design uploaded as draft. Publish it when ready.');
  }catch(e){setMessage(e instanceof Error?e.message:'Upload failed');}finally{setBusy(false);}
 }
 async function save(frame:Frame,patch:Partial<Frame>){
  setBusy(true);setMessage('');
  try{
   const r=await fetch('/api/admin-frame-templates',{method:'PATCH',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id:frame.id,...patch})});
   const data=await r.json();if(!r.ok)throw Error(data.error||'Could not save');
   await refresh();setMessage('Changes saved.');
  }catch(e){setMessage(e instanceof Error?e.message:'Could not save');}finally{setBusy(false);}
 }
 return <section className="wrap" style={{maxWidth:1050}}>
  <span className="eyebrow">OWNER / DESIGN STUDIO</span><h1>Frame templates</h1>
  <p className="lead">Upload your own Canva frames. Start as a draft, preview, then publish to the customer design dropdown. Use a transparent centre where the customer's photo should show.</p>
  <form className="card" onSubmit={create} style={{display:'grid',gap:14,marginBottom:24}}>
    <h2>Add a new frame</h2>
    <label>Design name <input required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="Luxury floral roses" /></label>
    <label>Image (transparent PNG or WebP, up to 5 MB) <input id="frame-upload" type="file" accept="image/png,image/webp" required onChange={e=>setFile(e.target.files?.[0]||null)}/></label>
    <label>Orientation <select value={orientation} onChange={e=>setOrientation(e.target.value)}>
      <option value="portrait">Portrait</option><option value="landscape">Landscape</option><option value="square">Square</option>
    </select></label>
    <fieldset style={{border:'1px solid #ddd',borderRadius:8,padding:12}}>
     <legend>Available for products</legend>
     <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))',gap:10}}>
       {products.map(p=><label key={p.slug} style={{display:'flex',gap:8,alignItems:'center'}}>
        <input type="checkbox" checked={selected.includes(p.slug)} onChange={e=>setSelected(a=>e.target.checked?[...a,p.slug]:a.filter(x=>x!==p.slug))}/>{p.name}
       </label>)}
     </div>
    </fieldset>
    {file && <p>Selected: {file.name}</p>}
    <button type="submit" className="btn" disabled={busy || !file || selected.length===0}>{busy?'Saving…':'Upload draft frame'}</button>
  </form>
  {message&&<p role="status" className="card">{message}</p>}
  <h2>Saved designs ({frames.length})</h2>
  {!frames.length&&<p>No uploaded frames yet. Your existing built-in designs will continue to work.</p>}
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:18}}>
   {frames.map(frame=><article className="card" key={frame.id} style={{display:'grid',gap:12}}>
     <div style={{aspectRatio:frame.orientation==='landscape'?'4/3':frame.orientation==='square'?'1':'3/4',
       background:'repeating-conic-gradient(#eee 0% 25%,#fff 0% 50%) 50%/20px 20px',maxHeight:300,overflow:'hidden'}}>
       <img src={frame.url} alt={frame.name} style={{width:'100%',height:'100%',objectFit:'contain'}} />
     </div>
     <div><strong>{frame.name}</strong><p>{frame.orientation} · {frame.published?'Published':'Draft'}</p></div>
     <label>Name <input defaultValue={frame.name} key={frame.id+frame.name}
       onBlur={e=>{const v=e.target.value.trim();if(v&&v!==frame.name)void save(frame,{name:v});}} /></label>
     <label>Sort order <input type="number" defaultValue={frame.sortOrder} key={frame.id+frame.sortOrder}
       onBlur={e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n!==frame.sortOrder)void save(frame,{sortOrder:n});}} /></label>
     <p style={{fontSize:13}}>Products: {frame.productSlugs.map(s=>products.find(p=>p.slug===s)?.name||s).join(', ')}</p>
     <button className="btn small" disabled={busy} onClick={()=>void save(frame,{published:!frame.published})}>
       {frame.published?'Unpublish':'Publish to customers'}
     </button>
    </article>)}
  </div>
  <p style={{marginTop:24}}>Note: check the customer preview and print artwork carefully before fulfilling an order featuring a newly uploaded frame.</p>
 </section>;
}
