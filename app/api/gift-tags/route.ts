import { NextResponse } from 'next/server';
import { loadGiftTags } from '@/lib/giftTagCatalogueServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ tags: await loadGiftTags() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not load Gift Tags.' }, { status: 503 });
  }
}
