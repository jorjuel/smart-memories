import { NextResponse } from 'next/server';
import { createSupabaseAdminAuthClient } from '@/lib/supabaseAdminAuthServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { products } from '@/lib/products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'product-catalog';
const allowedSlugs = new Set(products.map((p) => p.slug));
const MAX_BYTES = 3 * 1024 * 1024;
const filename = (slug: string) => `${slug}.jpg`;

async function isOwner() {
  const auth = await createSupabaseAdminAuthClient();
  const { data: { user } } = await auth.auth.getUser();
  const email = user?.email?.trim().toLowerCase();
  const owners = (process.env.ADMIN_EMAILS || '').split(',')
    .map((e) => e.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && owners.includes(email));
}

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const actual = new URL(origin);
    const expected = new URL(request.url);
    return actual.hostname === expected.hostname &&
      actual.protocol === expected.protocol;
  } catch { return false; }
}

export async function GET() {
  const client = supabaseAdmin();
  const { data, error } = await client.storage.from(BUCKET).list('', {
    limit: 100,
  });
  if (error) {
    // Keep product cards usable until the catalogue bucket is provisioned.
    return NextResponse.json({ images: {}, configured: false }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
  const images: Record<string, string> = {};
  for (const item of data || []) {
    if (!item.name.endsWith('.jpg')) continue;
    const slug = item.name.slice(0, -4);
    if (!allowedSlugs.has(slug)) continue;
    const url = client.storage.from(BUCKET).getPublicUrl(item.name).data.publicUrl;
    const version = item.updated_at ? Date.parse(item.updated_at) : 0;
    images[slug] = version > 0 ? `${url}?v=${version}` : url;
  }
  return NextResponse.json({ images, configured: true }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  if (!(await isOwner())) return NextResponse.json({ error: 'Not authorised.' }, { status: 403 });
  const form = await request.formData();
  const slug = form.get('slug');
  const file = form.get('file');
  if (typeof slug !== 'string' || !allowedSlugs.has(slug) ||
      !(file instanceof File) || file.type !== 'image/jpeg' ||
      file.size < 1 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Upload a JPEG under 3 MB for a valid product.' }, { status: 400 });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
    return NextResponse.json({ error: 'Invalid JPEG image.' }, { status: 400 });
  }
  const { error } = await supabaseAdmin().storage.from(BUCKET).upload(
    filename(slug), bytes, { contentType: 'image/jpeg', upsert: true, cacheControl: '60' },
  );
  if (error) return NextResponse.json({
    error: 'Cloud photo storage is not ready. Create the product-catalog bucket in Supabase.',
  }, { status: 503 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  if (!(await isOwner())) return NextResponse.json({ error: 'Not authorised.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const slug = body?.slug;
  if (typeof slug !== 'string' || !allowedSlugs.has(slug)) {
    return NextResponse.json({ error: 'Invalid product.' }, { status: 400 });
  }
  const { error } = await supabaseAdmin().storage.from(BUCKET).remove([filename(slug)]);
  if (error) return NextResponse.json({ error: 'Could not remove product image.' }, { status: 503 });
  return NextResponse.json({ ok: true });
}
