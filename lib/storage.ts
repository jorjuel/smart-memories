export type MemoryRecord={
  code:string; recipient:string; message:string; sender:string; createdAt:string;
  photo?:Blob; audio?:Blob; audioType?:string;
};
const DB='smart-memories-v4', STORE='memories';
function db():Promise<IDBDatabase>{
  return new Promise((resolve,reject)=>{
    const r=indexedDB.open(DB,1);
    r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'code'})};
    r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error);
  });
}
export async function saveMemory(m:MemoryRecord){const d=await db();return new Promise<void>((res,rej)=>{const t=d.transaction(STORE,'readwrite');t.objectStore(STORE).put(m);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)})}
export async function getMemory(code:string){const d=await db();return new Promise<MemoryRecord|undefined>((res,rej)=>{const r=d.transaction(STORE).objectStore(STORE).get(code);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
export async function getMemories(){const d=await db();return new Promise<MemoryRecord[]>((res,rej)=>{const r=d.transaction(STORE).objectStore(STORE).getAll();r.onsuccess=()=>res((r.result||[]).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));r.onerror=()=>rej(r.error)})}
export async function deleteMemory(code:string){const d=await db();return new Promise<void>((res,rej)=>{const t=d.transaction(STORE,'readwrite');t.objectStore(STORE).delete(code);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)})}
export function makeCode(){const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from({length:8},()=>c[Math.floor(Math.random()*c.length)]).join('')}
