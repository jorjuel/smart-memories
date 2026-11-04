import { NextResponse } from 'next/server';
import { draftIdPattern, draftOwner, getDraftAdmin } from '@/lib/memoryDrafts';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime='nodejs';
const jsonError=(error:string,status:number)=>NextResponse.json({error},{status});
type Context={params:Promise<{id:string}>};
async function getOwned(id:string) {
  const user=await draftOwner();
  if (!user) return {error:'Sign in to access drafts.',status:401} as const;
  if (!draftIdPattern.test(id)) return {error:'Draft not found.',status:404} as const;
  const result=await getDraftAdmin().select('id,user_id,product_slug,title,step_index,details,photo_path,audio_path,status,updated_at')
    .eq('id',id).eq('user_id',user.id).maybeSingle();
  if (result.error) return {error:'Draft storage is not ready.',status:503} as const;
  if (!result.data) return {error:'Draft not found.',status:404} as const;
  return {user,draft:result.data} as const;
}
export async function GET(_request:Request,{params}:Context) {
  const {id}=await params;
  const result=await getOwned(id);
  if ('error' in result) return jsonError(result.error,result.status);
  if (result.draft.status!=='draft') return jsonError('Draft not found.',404);
  const storage=supabaseAdmin().storage.from('draft-media');
  const urls:{photoUrl?:string;audioUrl?:string}={};
  for (const [kind,path] of [['photo',result.draft.photo_path],['audio',result.draft.audio_path]] as const) {
    if (!path) continue;
    const {data,error}=await storage.createSignedUrl(path,600);
    if (error || !data) return jsonError('Cannot retrieve draft media.',503);
    if (kind==='photo') urls.photoUrl=data.signedUrl;
    else urls.audioUrl=data.signedUrl;
  }
  return NextResponse.json({draft:result.draft,...urls});
}
export async function PATCH(request:Request,{params}:Context) {
  const {id}=await params;
  const result=await getOwned(id);
  if ('error' in result) return jsonError(result.error,result.status);
  if (result.draft.status!=='draft') return jsonError('Draft not found.',404);
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)return jsonError('Invalid origin.',403);
  const body=await request.json().catch(()=>null);
  if(!body || body.action!=='complete')return jsonError('Invalid action.',400);
  const response=await getDraftAdmin().update({status:'completed',updated_at:new Date().toISOString()})
    .eq('id',id).eq('user_id',result.user.id).eq('status','draft');
  if(response.error)return jsonError('Could not complete draft.',503);
  return NextResponse.json({ok:true});
}
