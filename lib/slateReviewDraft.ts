import type {GiftStudioSlug} from './giftStudioProducts';
export type SlateReviewDraft = {
  productSlug: GiftStudioSlug;
  photo: File;
  audio: Blob | null;
  sizeIndex: number;
  direction: 'portrait'|'landscape';
  crop: {zoom:number;dx:number;dy:number};
  fit: 'contain'|'cover';
  rotation: number;
  wording: 'none'|'bottom'|'top'|'both'|'paragraph';
  occasion: string;
  topText: string;
  bottomText: string;
  dedication: string;
  message: string;
  recipient: string;
  sender: string;
};
const DB='smart-memories-slate-review-v1';
const STORE='drafts';
const keyFor=(slug:GiftStudioSlug)=>`gift:${slug}`;
function openDb():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE);};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||Error('Local draft storage is unavailable'));
 });
}
async function transaction<T>(mode:IDBTransactionMode,handler:(store:IDBObjectStore,resolve:(value:T)=>void,reject:(error:unknown)=>void)=>void):Promise<T>{
 const db=await openDb();
 return new Promise<T>((resolve,reject)=>{
  const tx=db.transaction(STORE,mode);
  tx.oncomplete=()=>db.close();
  tx.onabort=()=>{db.close();reject(tx.error||Error('Draft storage failed'));};
  handler(tx.objectStore(STORE),resolve,reject);
 });
}
export async function storeSlateDraft(draft:SlateReviewDraft):Promise<void>{
 const db=await openDb();
 await new Promise<void>((resolve,reject)=>{
  const tx=db.transaction(STORE,'readwrite');
  tx.objectStore(STORE).put(draft,keyFor(draft.productSlug));
  tx.oncomplete=()=>resolve();
  tx.onerror=()=>reject(tx.error||Error('Draft save failed'));
  tx.onabort=()=>reject(tx.error||Error('Draft save aborted'));
 });
 db.close();
}
export function loadSlateDraft(slug:GiftStudioSlug='smart-photo-slate'):Promise<SlateReviewDraft|null>{
 return transaction<SlateReviewDraft|null>('readonly',(store,resolve,reject)=>{
  const req=store.get(keyFor(slug));
  req.onsuccess=()=>resolve(req.result as SlateReviewDraft||null);
  req.onerror=()=>reject(req.error);
 });
}
export function clearSlateDraft(slug:GiftStudioSlug='smart-photo-slate'):Promise<void>{
 return transaction<void>('readwrite',(store,resolve,reject)=>{
  const req=store.delete(keyFor(slug));req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error);
 });
}
