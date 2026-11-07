'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import RecipientMemoryExperience from '@/components/recipient/RecipientMemoryExperience';
import type {PublicMemory} from '@/components/recipient/types';

type LoadStatus='loading'|'missing'|'error'|'ready';
const LOAD_TIMEOUT_MS=12000;

export default function MemoryPage({params}:{params:Promise<{code:string}>}){
 const [memory,setMemory]=useState<PublicMemory|null>(null);
 const [status,setStatus]=useState<LoadStatus>('loading');
 const [attempt,setAttempt]=useState(0);

 useEffect(()=>{
  let active=true;
  const controller=new AbortController();
  // Guard both the route-param resolution and the API request. Either can stall.
  const timeout=window.setTimeout(()=>controller.abort(),LOAD_TIMEOUT_MS);
  setStatus('loading');
  setMemory(null);
  async function load(){
   try{
    const {code}=await params;
    if(!active||controller.signal.aborted)return;
    if(!code?.trim())throw new Error('Missing memory code');
    const response=await fetch(`/api/memories/${encodeURIComponent(code)}`,{
     cache:'no-store',signal:controller.signal,
    });
    if(!active)return;
    if(response.status===404){setStatus('missing');return;}
    if(!response.ok)throw new Error('Memory service unavailable');
    const data=(await response.json()) as PublicMemory;
    if(!data?.code)throw new Error('Invalid memory response');
    if(active){setMemory(data);setStatus('ready');}
   }catch{
    if(active)setStatus('error');
   }finally{
    window.clearTimeout(timeout);
   }
  }
  void load();
  // Even if the route promise itself never settles, leave the loading screen.
  const onTimeout=window.setTimeout(()=>{
   if(active){controller.abort();setStatus('error');}
  },LOAD_TIMEOUT_MS);
  return()=>{active=false;controller.abort();window.clearTimeout(timeout);window.clearTimeout(onTimeout);};
 },[params,attempt]);

 if(status==='loading'){
  return <section className="smRecipientState" role="status" aria-live="polite">
   <div className="smRecipientStateMark">♡</div>
   <span>SMART MEMORIES</span>
   <h1>Opening your memory...</h1>
   <div className="smRecipientLoadingLine" aria-hidden="true"><span/></div>
  </section>;
 }

 if(status==='error'){
  return <section className="smRecipientState smRecipientMissing" role="alert">
   <div className="smRecipientStateMark">♡</div>
   <span>SMART MEMORIES</span>
   <h1>Your memory is taking longer than expected.</h1>
   <p>We couldn't load it just now. Your Smart Memory may still be saved — please try again.</p>
   <button type="button" className="smRecipientStateButton" onClick={()=>setAttempt(n=>n+1)}>Try again</button>
   <Link href="/" className="smRecipientStateButton">Go to Smart Memories</Link>
  </section>;
 }

 if(status==='missing'||!memory){
  return <section className="smRecipientState smRecipientMissing">
   <div className="smRecipientStateMark">♡</div>
   <span>SMART MEMORIES</span>
   <h1>We couldn't find this Smart Memory.</h1>
   <p>Check the link or try tapping or scanning the gift again.</p>
   <button type="button" className="smRecipientStateButton" onClick={()=>setAttempt(n=>n+1)}>Try again</button>
   <Link href="/" className="smRecipientStateButton">Go to Smart Memories</Link>
  </section>;
 }
 return <RecipientMemoryExperience memory={memory}/>;
}
