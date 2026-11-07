import { NextResponse } from 'next/server';
import { createSupabaseAdminAuthClient } from '@/lib/supabaseAdminAuthServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { products } from '@/lib/products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const BUCKET = 'gift-frame-overlays';
const SLUGS = new Set(products.map(p => p.slug));
const ALLOWED_ORIENTATIONS = new Set(['portrait','landscape','square']);
type TemplateRow = {id:string;name:string;product_slugs:string[];orientation:string;asset_path:string;published:boolean;sort_order:number};
async function owner() {
  const auth = await createSupabaseAdminAuthClient();
  const {data:{user}} = await auth.auth.getUser();
  const allowed = (process.env.ADMIN_EMAILS || '').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  return Boolean(user?.email && allowed.includes(user.email.toLowerCase()));
}
function sameOrigin(r:Request) {
  const origin = r.headers.get('origin');
  if (!origin) return true;
  try {const a = new URL(origin), b = new URL(r.url);return a.origin === b.origin;} catch {return false;}
}
function normalise(data: TemplateRow) {
  const {data:asset} = supabaseAdmin().storage.from(BUCKET).getPublicUrl(data.asset_path);
  return {id:data.id,name:data.name,productSlugs:data.product_slugs,
    orientation:data.orientation,url:asset.publicUrl,published:data.published,sortOrder:data.sort_order};
}
function validSlugs(value:unknown):value is string[] {
 return Array.isArray(value) && value.length>0 && value.length<=products.length &&
 value.every((x:unknown)=>typeof x==='string' && SLUGS.has(x));
}
export async function GET(request:Request) {
 try {
   const all = new URL(request.url).searchParams.get('all')==='1';
   if (all && !(await owner())) return NextResponse.json({error:'Not authorised'}, {status:403});
   let q = supabaseAdmin().from('gift_frame_templates').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:true});
   if(!all) q=q.eq('published',true);
   const {data,error}=await q;
   if(error) throw error;
   return NextResponse.json({templates:(data as TemplateRow[]).map(normalise)}, {headers:{'Cache-Control':'no-store'}});
 } catch {return NextResponse.json({error:'Frame templates storage is not configured. Apply the SQL migration.'},{status:503});}
}
export async function POST(request:Request) {
 if(!sameOrigin(request) || !(await owner())) return NextResponse.json({error:'Not authorised'},{status:403});
 const form=await request.formData().catch(()=>null);
 const name=form?.get('name'), orientation=form?.get('orientation'), file=form?.get('file');
 let slugs:unknown;
 try {slugs=JSON.parse(String(form?.get('productSlugs') || 'null'));} catch {slugs=null;}
 if(typeof name!=='string' || name.trim().length<2 || name.trim().length>100 ||
 typeof orientation!=='string' || !ALLOWED_ORIENTATIONS.has(orientation) ||
 !validSlugs(slugs) || !(file instanceof File) || file.size<1 || file.size>5*1024*1024 ||
 !['image/png','image/webp'].includes(file.type))
 return NextResponse.json({error:'Supply a name, valid products and a PNG/WebP under 5MB.'},{status:400});
 const buf=Buffer.from(await file.arrayBuffer());
 const png=buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 const webp=buf.toString('ascii',0,4)==='RIFF' && buf.toString('ascii',8,12)==='WEBP';
 if((file.type==='image/png'&&!png)||(file.type==='image/webp'&&!webp))
 return NextResponse.json({error:'Invalid image format'},{status:400});
 const id=crypto.randomUUID(), path=`${id}.${png?'png':'webp'}`;
 const db=supabaseAdmin();
 const uploaded=await db.storage.from(BUCKET).upload(path,buf,{contentType:file.type,upsert:false,cacheControl:'3600'});
 if(uploaded.error) return NextResponse.json({error:'Storage unavailable. Apply migration first.'},{status:503});
 const {data,error}=await db.from('gift_frame_templates').insert({
  id,name:name.trim(),orientation,product_slugs:slugs,asset_path:path,published:false
 }).select('*').single();
 if(error) {
   await db.storage.from(BUCKET).remove([path]);
   return NextResponse.json({error:'Could not save design metadata. Check migration.'},{status:503});
 }
 return NextResponse.json({template:normalise(data as TemplateRow)},{status:201});
}
export async function PATCH(request:Request) {
 if(!sameOrigin(request) || !(await owner())) return NextResponse.json({error:'Not authorised'},{status:403});
 const body=await request.json().catch(()=>null);
 if(!body || typeof body.id!=='string' || !/^[a-f0-9-]{36}$/i.test(body.id))
 return NextResponse.json({error:'Invalid design ID'},{status:400});
 const patch:Record<string,unknown>={};
 if('name' in body) {
  if(typeof body.name!=='string' || body.name.trim().length<2 || body.name.length>100)
   return NextResponse.json({error:'Invalid name'},{status:400});
  patch.name=body.name.trim();
 }
 if('published' in body) {
  if(typeof body.published!=='boolean') return NextResponse.json({error:'Invalid status'},{status:400});
  patch.published=body.published;
 }
 if('orientation' in body) {
  if(typeof body.orientation!=='string'||!ALLOWED_ORIENTATIONS.has(body.orientation))
   return NextResponse.json({error:'Invalid orientation'},{status:400});
  patch.orientation=body.orientation;
 }
 if('productSlugs' in body) {
  if(!validSlugs(body.productSlugs)) return NextResponse.json({error:'Invalid products'},{status:400});
  patch.product_slugs=body.productSlugs;
 }
 if('sortOrder' in body) {
  if(!Number.isInteger(body.sortOrder) || Math.abs(body.sortOrder)>100000)
   return NextResponse.json({error:'Invalid sort order'},{status:400});
  patch.sort_order=body.sortOrder;
 }
 if(!Object.keys(patch).length) return NextResponse.json({error:'Nothing to change'},{status:400});
 patch.updated_at=new Date().toISOString();
 const {data,error}=await supabaseAdmin().from('gift_frame_templates').update(patch).eq('id',body.id).select('*').maybeSingle();
 if(error) return NextResponse.json({error:'Could not save design'},{status:503});
 if(!data) return NextResponse.json({error:'Design not found'},{status:404});
 return NextResponse.json({template:normalise(data as TemplateRow)});
}
export async function DELETE(request:Request) {
 if(!sameOrigin(request) || !(await owner())) return NextResponse.json({error:'Not authorised'},{status:403});
 const body=await request.json().catch(()=>null);
 if(typeof body?.id!=='string') return NextResponse.json({error:'Invalid design ID'},{status:400});
 // Archive rather than delete: preserve older customer order references.
 const {error}=await supabaseAdmin().from('gift_frame_templates').update({published:false}).eq('id',body.id);
 if(error) return NextResponse.json({error:'Could not archive'},{status:503});
 return NextResponse.json({ok:true});
}
