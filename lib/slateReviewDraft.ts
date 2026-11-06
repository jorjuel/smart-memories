export type SlateReviewDraft = {
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
const KEY='current';
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
export function storeSlateDraft(draft:SlateReviewDraft):Promise<void>{
 return transaction<void>('readwrite',(store,resolve,reject)=>{
  const req=store.put(draft,KEY);
  req.onsuccess=()=>resolve();
  req.onerror=()=>reject(req.error);
 });
}
export function loadSlateDraft():Promise<SlateReviewDraft|null>{
 return transaction<SlateReviewDraft|null>('readonly',(store,resolve,reject)=>{
  const req=store.get(KEY);
  req.onsuccess=()=>resolve(req.result as SlateReviewDraft||null);
  req.onerror=()=>reject(req.error);
 });
}
export function clearSlateDraft():Promise<void>{
 return transaction<void>('readwrite',(store,resolve,reject)=>{
  const req=store.delete(KEY);req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error);
 });
}
