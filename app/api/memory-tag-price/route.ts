import { NextResponse } from 'next/server';
import { getProductPricePence } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

/** Match the server-authoritative price used by the order API. */
export async function GET() {
  return NextResponse.json(
    {available:true,pricePence:getProductPricePence('memory-tag')},
    {headers:{'Cache-Control':'no-store'}}
  );
}
