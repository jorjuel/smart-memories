import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Pricing is configured by the owner, never assumed by the UI. */
export async function GET() {
  const value = process.env.MEMORY_TAG_PRICE_PENCE;
  const pricePence = value ? Number(value) : NaN;
  if (!Number.isInteger(pricePence) || pricePence <= 0) {
    return NextResponse.json({available:false}, {headers:{'Cache-Control':'no-store'}});
  }
  return NextResponse.json({available:true,pricePence}, {headers:{'Cache-Control':'no-store'}});
}
