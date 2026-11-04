import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { draftIdPattern, draftOwner, getDraftAdmin } from '@/lib/memoryDrafts';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime='nodejs';
const formats:Record<string,{extension:string;kind:'photo'|'audio';max:number}>={
  'image/jpeg':{extension:'jpg',kind:'photo',max:10*1024*1024},
  'image/png':{extension:'png',kind:'photo',max:10*1024*1024},
  'image/webp':{extension:'webp',kind:'photo',max:10*1024*1024},
  'image/heic':{extension:'heic',kind:'photo',max:10*1024*1024},
  'audio/webm':{extension:'webm',kind:'audio',max:25*1024*1024},
  'audio/mp4':{extension:'m4a',kind:'audio',max:25*1024*1024},
  'audio/mpeg':{extension:'mp3',kind:'audio',max:25*1024*1024},
  'audio/ogg':{extension:'ogg',kind:'audio',max:25*1024*1024},
  'audio/wav':{extension:'wav',kind:'audio',max:25*1024*1024},
  'audio/x-wav':{extension:'wav',kind:'audio',max:25*1024*1024},
};
export async function POST(request:Request) {
  const user=await draftOwner();
  if(!user)return NextResponse.json({error:'Sign in to save draft media.'},{status:401});
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)
    return NextResponse.json({error:'Invalid origin.'},{status:403});
  const raw=await request.text();
  if(raw.length>2000)return NextResponse.json({error:'Invalid upload.'},{status:400});
  let payload: {draftId?:unknown;kind?:unknown;contentType?:unknown;size?:unknown};
  try {payload=JSON.parse(raw)}catch{return NextResponse.json({error:'Invalid upload.'},{status:400})}
  const id=payload.draftId;
  const kind=payload.kind;
  const contentType=typeof payload.contentType==='string'?payload.contentType.toLowerCase().split(';')[0]:'';
  const format=formats[contentType];const size=payload.size;
  if(typeof id!=='string'||!draftIdPattern.test(id)||!format||format.kind!==kind||
    !Number.isInteger(size)||typeof size!=='number'||size<1||size>format.max)
    return NextResponse.json({error:'Unsupported draft media.'},{status:400});
  const {data:draft,error:fetchError}=await getDraftAdmin().select('id')
    .eq('id',id).eq('user_id',user.id).eq('status','draft').maybeSingle();
  if(fetchError)return NextResponse.json({error:'Draft storage is not ready.'},{status:503});
  if(!draft)return NextResponse.json({error:'Draft not found.'},{status:404});
  const path=`${user.id}/${id}/${kind}-${randomUUID()}.${format.extension}`;
  const {data,error}=await supabaseAdmin().storage.from('draft-media').createSignedUploadUrl(path);
  if(error||!data){console.error('DRAFT UPLOAD SIGN ERROR',error);return NextResponse.json({error:'Could not prepare upload.'},{status:503})}
  return NextResponse.json({path:data.path,token:data.token});
}
