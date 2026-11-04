import { NextResponse } from 'next/server';
import { draftIdPattern, sanitiseDraftDetails, allowedDraftSlug, draftOwner, getDraftAdmin, draftStoragePathOwned } from '@/lib/memoryDrafts';

export const runtime = 'nodejs';
const fields = 'id,product_slug,title,step_index,details,photo_path,audio_path,status,updated_at';
const jsonError = (message:string,status:number) => NextResponse.json({error:message},{status});

export async function GET() {
  const user = await draftOwner();
  if (!user) return jsonError('Sign in to access your drafts.',401);
  const {data,error} = await getDraftAdmin().select(fields)
    .eq('user_id',user.id).eq('status','draft')
    .order('updated_at',{ascending:false}).limit(40);
  if (error) { console.error('LIST DRAFTS ERROR',error); return jsonError('Draft storage is not ready.',503); }
  return NextResponse.json({drafts:data || []});
}

export async function POST(request:Request) {
  const user = await draftOwner();
  if (!user) return jsonError('Sign in to save drafts across devices.',401);
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return jsonError('Invalid request origin.',403);
  try {
    const raw = await request.text();
    if (raw.length > 16000) return jsonError('Draft is too large.',413);
    const input = JSON.parse(raw);
    const {id,slug,stepIndex,photoPath,audioPath} = input;
    if (typeof id !== 'string' || !draftIdPattern.test(id) ||
        typeof slug !== 'string' || !allowedDraftSlug(slug))
      return jsonError('Invalid draft.',400);
    const step = Math.max(0,Math.min(10,Number.isInteger(stepIndex)?stepIndex:0));
    const details = sanitiseDraftDetails(input.details);
    const title = (details.recipient ? 'Memory for '+details.recipient : 'Untitled Smart Gift').slice(0,160);
    const existing = await getDraftAdmin().select('id,user_id,status,photo_path,audio_path')
      .eq('id',id).maybeSingle();
    if (existing.error) return jsonError('Draft storage is not ready.',503);
    if (existing.data && (existing.data.user_id !== user.id || existing.data.status !== 'draft'))
      return jsonError('Draft not found.',404);
    const media = {photo_path:existing.data?.photo_path ?? null,audio_path:existing.data?.audio_path ?? null};
    for (const [kind,value] of [['photo',photoPath],['audio',audioPath]] as const) {
      if (value === undefined) continue;
      if (value !== null && (typeof value !== 'string' ||
          !draftStoragePathOwned(value,user.id,id,kind))) return jsonError('Invalid draft media path.',400);
      // Each uploaded path has a random owner-scoped name. Verify storage object exists.
      if (value) {
        const {data,error} = await (await import('@/lib/supabaseAdmin')).supabaseAdmin().storage
          .from('draft-media').info(value);
        if (error || !data) return jsonError('Draft media upload is missing.',400);
        const max = kind === 'photo' ? 10*1024*1024 : 25*1024*1024;
        if (Number(data.size || 0) < 1 || Number(data.size || 0) > max || !data.contentType?.startsWith(kind === 'photo'?'image/':'audio/'))
          return jsonError('Invalid draft media.',400);
      }
      if (kind === 'photo') media.photo_path = value;
      else media.audio_path = value;
    }
    const data = {product_slug:slug,title,step_index:step,details,...media,updated_at:new Date().toISOString()};
    const result = existing.data
      ? await getDraftAdmin().update(data).eq('id',id).eq('user_id',user.id).eq('status','draft').select(fields).single()
      : await getDraftAdmin().insert({id,user_id:user.id,status:'draft',...data}).select(fields).single();
    if (result.error) { console.error('SAVE DRAFT ERROR',result.error); return jsonError('Could not save draft.',503); }
    return NextResponse.json({draft:result.data});
  } catch (e) { console.error('SAVE DRAFT INPUT ERROR',e); return jsonError('Could not save draft.',400); }
}
