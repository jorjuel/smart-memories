import { createClient } from '@supabase/supabase-js';
import type { DraftDetails } from '@/lib/memoryDrafts';

export type DraftRecord = {
  id:string;product_slug:string;title:string;step_index:number;
  details:DraftDetails;photo_path:string|null;audio_path:string|null;
  status:string;updated_at:string;
};
async function parseJson(response:Response) {
  if(!(response.headers.get('content-type')||'').includes('application/json'))
    throw new Error('The draft service is temporarily unavailable.');
  const data=await response.json();
  if(!response.ok) throw new Error(data?.error||'Could not save your draft.');
  return data;
}
export async function persistDraft(input:{
  id:string;slug:string;stepIndex:number;details:DraftDetails;
  photoPath?:string|null;audioPath?:string|null
}):Promise<DraftRecord> {
  const res=await fetch('/api/drafts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
  return (await parseJson(res)).draft as DraftRecord;
}
export async function retrieveDraft(id:string) {
  const res=await fetch('/api/drafts/'+encodeURIComponent(id),{cache:'no-store'});
  return await parseJson(res) as {draft:DraftRecord;photoUrl?:string;audioUrl?:string};
}
export async function uploadPrivateDraftMedia(draftId:string,file:Blob,kind:'photo'|'audio') {
  const type=file.type.toLowerCase().split(';')[0]||(kind==='audio'?'audio/webm':'image/jpeg');
  const response=await fetch('/api/draft-upload',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({draftId,kind,contentType:type,size:file.size})});
  const {path,token}=await parseJson(response) as {path:string;token:string};
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key)throw new Error('Draft media storage is not configured.');
  const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {error}=await client.storage.from('draft-media')
    .uploadToSignedUrl(path,token,file,{contentType:type});
  if(error)throw new Error('Could not save the '+kind+' to your draft.');
  return path as string;
}
export async function completeDraft(id:string) {
  const res=await fetch('/api/drafts/'+encodeURIComponent(id),
    {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'complete'})});
  await parseJson(res);
}
