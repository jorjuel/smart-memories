import {NextResponse} from 'next/server';
import {createSupabaseAdminAuthClient} from '@/lib/supabaseAdminAuthServer';
import {supabaseAdmin} from '@/lib/supabaseAdmin';
import {products} from '@/lib/products';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const BUCKET='product-catalog', slugs=new Set(products.map(p=>p.slug));
async function owner(){
 const auth=await createSupabaseAdminAuthClient();const {data:{user}}=await auth.auth.getUser();
 const allowed=(process.env.ADMIN_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
 return Boolean(user?.email&&allowed.includes(user.email.toLowerCase()));
}
function sameOrigin(r:Request){
 const o=r.headers.get('origin');if(!o)return true;
 try{return new URL(o).origin===new URL(r.url).origin;}catch{return false;}
}
function validSlug(x:unknown):x is string{return typeof x==='string'&&slugs.has(x);}
export async function GET(request:Request){
 if(!(await owner()))return NextResponse.json({error:'Not authorised'},{status:403});
 const slug=new URL(request.url).searchParams.get('slug');
 if(!validSlug(slug))return NextResponse.json({error:'Invalid product'},{status:400});
 const db=supabaseAdmin();
 const {data,error}=await db.storage.from(BUCKET).list(slug,{limit:100,sortBy:{column:'name',order:'asc'}});
 if(error)return NextResponse.json({error:'Product catalogue storage unavailable'},{status:503});
 const files=(data||[]).filter(x=>/^[a-f0-9-]{36}\.jpg$/i.test(x.name)).map(x=>({
  path:`${slug}/${x.name}`,
  url:db.storage.from(BUCKET).getPublicUrl(`${slug}/${x.name}`).data.publicUrl,
 }));
 return NextResponse.json({photos:files},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(request:Request){
 if(!sameOrigin(request)||!(await owner()))return NextResponse.json({error:'Not authorised'},{status:403});
 const form=await request.formData().catch(()=>null);
 const slug=form?.get('slug'),file=form?.get('file');
 if(!validSlug(slug)||!(file instanceof File)||file.type!=='image/jpeg'||file.size<1||file.size>3*1024*1024)
 return NextResponse.json({error:'Choose a valid product and JPEG below 3MB'},{status:400});
 const bytes=Buffer.from(await file.arrayBuffer());
 if(bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)
 return NextResponse.json({error:'Invalid JPEG'},{status:400});
 const path=`${slug}/${crypto.randomUUID()}.jpg`;
 const {error}=await supabaseAdmin().storage.from(BUCKET).upload(path,bytes,{contentType:'image/jpeg',cacheControl:'60'});
 if(error)return NextResponse.json({error:'Could not upload gallery image'},{status:503});
 return NextResponse.json({ok:true},{status:201});
}
export async function PATCH(request:Request){
 if(!sameOrigin(request)||!(await owner()))return NextResponse.json({error:'Not authorised'},{status:403});
 const body=await request.json().catch(()=>null);
 if(!validSlug(body?.slug)||typeof body?.path!=='string' ||
 !new RegExp('^'+body.slug+'/[a-f0-9-]{36}\\.jpg$','i').test(body.path))
 return NextResponse.json({error:'Invalid gallery image'},{status:400});
 const bucket=supabaseAdmin().storage.from(BUCKET);
 const {data,error}=await bucket.download(body.path);
 if(error||!data)return NextResponse.json({error:'Image unavailable'},{status:404});
 const bytes=Buffer.from(await data.arrayBuffer());
 const result=await bucket.upload(`${body.slug}.jpg`,bytes,{contentType:'image/jpeg',upsert:true,cacheControl:'60'});
 if(result.error)return NextResponse.json({error:'Could not set primary image'},{status:503});
 return NextResponse.json({ok:true});
}
export async function DELETE(request:Request){
 if(!sameOrigin(request)||!(await owner()))return NextResponse.json({error:'Not authorised'},{status:403});
 const body=await request.json().catch(()=>null);
 if(!validSlug(body?.slug)||typeof body?.path!=='string'||
 !new RegExp('^'+body.slug+'/[a-f0-9-]{36}\\.jpg$','i').test(body.path))
 return NextResponse.json({error:'Invalid photo'},{status:400});
 const {error}=await supabaseAdmin().storage.from(BUCKET).remove([body.path]);
 if(error)return NextResponse.json({error:'Could not remove gallery photo'},{status:503});
 return NextResponse.json({ok:true});
}
