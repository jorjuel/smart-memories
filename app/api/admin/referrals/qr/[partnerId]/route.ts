import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { createSupabaseAdminAuthClient } from '@/lib/supabaseAdminAuthServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  context: { params: Promise<{ partnerId: string }> }
) {
  const auth = await createSupabaseAdminAuthClient();
  const { data: { user } } = await auth.auth.getUser();
  const allowed = (process.env.ADMIN_EMAILS || '').split(',')
    .map(x => x.trim().toLowerCase()).filter(Boolean);
  if (!user?.email || !allowed.includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const { partnerId } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(partnerId)) {
    return NextResponse.json({ error: 'Invalid partner ID' }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin()
    .from('referral_partners')
    .select('referral_code')
    .eq('id', partnerId)
    .eq('status', 'active')
    .maybeSingle();
  if (error) return NextResponse.json({ error: 'Lookup error' }, { status: 503 });
  if (!data) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });

  // Fixed production domain prevents Host-header based QR destination poisoning.
  const target = `https://smartmemories.co.uk/r/${encodeURIComponent(data.referral_code)}`;
  const svg = await QRCode.toString(target, { type: 'svg', errorCorrectionLevel: 'H', margin: 3, width: 1024 });
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="smart-memories-referral-${data.referral_code}.svg"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
