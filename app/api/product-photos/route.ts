import { NextResponse } from 'next/server';
import { boundedBody, normaliseCatalogueJpeg } from '@/lib/catalogueImageServer';
import { createSupabaseAdminAuthClient } from '@/lib/supabaseAdminAuthServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { products } from '@/lib/products';
import { cardPhotoSlugs } from '@/lib/cardDesigns';
import { loadCardCatalogue, loadGiftPrices, saveCatalogueCard, saveGiftPrice } from '@/lib/cardCatalogueServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'product-catalog';
const productSlugs = new Set(products.map((product) => product.slug));
async function allowedPhotoSlug(slug: string) {
  return productSlugs.has(slug) || (await loadCardCatalogue()).some((card) => cardPhotoSlugs(card.photoSlug).includes(slug));
}
const MAX_BYTES = 3 * 1024 * 1024;
const filename = (slug: string) => `${slug}.jpg`;

async function isOwner() {
  const auth = await createSupabaseAdminAuthClient();
  const { data: { user } } = await auth.auth.getUser();
  const email = user?.email?.trim().toLowerCase();
  const owners = (process.env.ADMIN_EMAILS || '').split(',')
    .map((e) => e.trim().toLowerCase()).filter(Boolean);
  return Boolean(user?.email_confirmed_at && email && owners.includes(email));
}

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    const requestUrl = new URL(request.url);
    // Next.js can use its configured hostname instead of the browser-facing Host.
    const host = request.headers.get('host') ?? requestUrl.host;
    const expectedOrigin = new URL(`${requestUrl.protocol}//${host}`).origin;
    return origin === expectedOrigin;
  } catch { return false; }
}


export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    return NextResponse.json({ images: {}, configured: false }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
  const client = supabaseAdmin();
  const catalogue = await Promise.all([loadCardCatalogue(), loadGiftPrices()]).catch(() => null);
  if (!catalogue) return NextResponse.json({ error: 'Could not load the catalogue.' }, { status: 503 });
  const [cards, giftPrices] = catalogue;
  const allowedSlugs = new Set([...productSlugs, ...cards.flatMap((card) => cardPhotoSlugs(card.photoSlug))]);
  const images: Record<string, string> = {};
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await client.storage.from(BUCKET).list('', {
      limit: 100, offset, sortBy: { column: 'name', order: 'asc' },
    });
    if (error) {
      return NextResponse.json({ images: {}, configured: false }, {
        headers: { 'Cache-Control': 'no-store' },
      });
    }
    for (const item of data) {
      if (!item.name.endsWith('.jpg')) continue;
      const slug = item.name.slice(0, -4);
      if (!allowedSlugs.has(slug)) continue;
      const url = client.storage.from(BUCKET).getPublicUrl(item.name).data.publicUrl;
      const version = item.updated_at ? Date.parse(item.updated_at) : 0;
      images[slug] = version > 0 ? `${url}?v=${version}` : url;
    }
    if (data.length < 100) break;
  }
  return NextResponse.json({ images, cards, giftPrices, configured: true }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  if (!(await isOwner())) return NextResponse.json({ error: 'Not authorised.' }, { status: 403 });
  const body = await boundedBody(request, MAX_BYTES + 16 * 1024);
  if (!body) return NextResponse.json({ error: 'Photo upload is too large.' }, { status: 413 });
  const form = await body.formData().catch(() => null);
  const slug = form?.get('slug');
  const file = form?.get('file');
  if (typeof slug !== 'string' || !(await allowedPhotoSlug(slug)) ||
      !(file instanceof File) || file.type !== 'image/jpeg' ||
      file.size < 1 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Upload a JPEG under 3 MB for a valid product or card design.' }, { status: 400 });
  }
  let bytes: Buffer;
  try {
    bytes = await normaliseCatalogueJpeg(file);
  } catch {
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
  const payload = await boundedBody(request, 4096);
  if (!payload) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });
  const body = await payload.json().catch(() => null);
  const slug = body?.slug;
  if (typeof slug !== 'string' || !(await allowedPhotoSlug(slug))) {
    return NextResponse.json({ error: 'Invalid product.' }, { status: 400 });
  }
  const { error } = await supabaseAdmin().storage.from(BUCKET).remove([filename(slug)]);
  if (error) return NextResponse.json({ error: 'Could not remove product image.' }, { status: 503 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  if (!(await isOwner())) return NextResponse.json({ error: 'Not authorised.' }, { status: 403 });

  const payload = await boundedBody(request, 4096);
  if (!payload) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });
  const body = await payload.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const basePricePence = body?.basePricePence;
  if (body?.giftSlug !== undefined) {
    if (!productSlugs.has(body.giftSlug) || !Number.isSafeInteger(basePricePence) || basePricePence < 1 || basePricePence > 99999) {
      return NextResponse.json({ error: 'Choose a gift and enter a price between £0.01 and £999.99.' }, { status: 400 });
    }
    try {
      await saveGiftPrice(body.giftSlug, basePricePence);
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error('Gift price save failed:', error);
      return NextResponse.json({ error: 'Could not save the gift price.' }, { status: 503 });
    }
  }
  if (!name || name.length > 100 || name.toLowerCase() === 'your own design' ||
      !Number.isSafeInteger(basePricePence) || basePricePence < 1 || basePricePence > 99999) {
    return NextResponse.json({ error: 'Enter a card title and a price between £0.01 and £999.99.' }, { status: 400 });
  }

  try {
    const cards = await loadCardCatalogue();
    const existing = cards.find((card) => card.photoSlug === body.photoSlug);
    if (body.photoSlug !== undefined && !existing) {
      return NextResponse.json({ error: 'Card design not found.' }, { status: 404 });
    }
    if (cards.some((card) => card.photoSlug !== existing?.photoSlug && card.name.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json({ error: 'A card with this title already exists.' }, { status: 409 });
    }
    const photoSlug = existing?.photoSlug ?? `card-${crypto.randomUUID()}`;
    await saveCatalogueCard({
      photoSlug,
      name, basePricePence,
      description: existing?.description ?? 'A handcrafted card personalised with your message.',
      mark: existing?.mark ?? '♥',
    });
    return NextResponse.json({ ok: true, photoSlug });
  } catch (error) {
    console.error('Card catalogue save failed:', error);
    return NextResponse.json({ error: 'Could not save the card design to catalogue storage.' }, { status: 503 });
  }
}
