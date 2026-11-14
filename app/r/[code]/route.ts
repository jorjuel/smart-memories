import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

/**
 * Public QR/NFC entrypoint. No tracking cookies or local storage are set.
 * Attribution still needs to be connected to the existing checkout flow.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const origin = new URL(request.url).origin;
  if (!/^[A-Z0-9-]{8,32}$/.test(code)) {
    return NextResponse.redirect(new URL('/', origin));
  }

  const { data: partner, error } = await supabaseAdmin()
    .from('referral_partners')
    .select('id,referral_code')
    .eq('referral_code', code)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Referral lookup failed', error.message);
    return NextResponse.json({ error: 'Referral is temporarily unavailable' }, { status: 503 });
  }
  if (!partner) return NextResponse.redirect(new URL('/', origin));

  // This is URL-scoped referral context only. It should not be treated as
  // authenticated proof of a commission, and it may be lost on navigation.
  const destination = new URL('/', origin);
  destination.searchParams.set('ref', partner.referral_code);
  return NextResponse.redirect(destination, { status: 302 });
}
