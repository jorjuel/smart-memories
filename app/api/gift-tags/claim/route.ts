import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

const errorResponse = () => NextResponse.json(
  { error: 'This tag cannot be activated. Check the activation details and the purchasing account.' },
  { status: 400 }
);

/**
 * This endpoint never issues tags or accepts an NFC public URL as ownership
 * evidence. A claim requires a separate secret AND an email-verified account
 * belonging to the purchaser of a verified paid order.
 */
export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 4096) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 413 });
    }
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return errorResponse();
    }

    const values = body as Record<string, unknown>;
    const code = typeof values.publicCode === 'string'
      ? values.publicCode.trim().toUpperCase() : '';
    const secret = typeof values.activationSecret === 'string'
      ? values.activationSecret.trim() : '';

    if (!/^[A-Z2-9]{12}$/.test(code) || !/^[A-Za-z0-9_-]{32,128}$/.test(secret)) {
      return errorResponse();
    }

    const auth = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await auth.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Sign in to activate your purchased tag.' }, { status: 401 });
    }
    if (!user.email || !user.email_confirmed_at) {
      return NextResponse.json({ error: 'Verify your email address before activating a tag.' }, { status: 403 });
    }

    const secretHash = createHash('sha256').update(secret, 'utf8').digest('hex');
    // Protected service role RPC performs one atomic claim and verifies paid
    // order ownership in the database before storing owner_user_id.
    const { data, error } = await supabaseAdmin().rpc('claim_paid_gift_tag', {
      p_public_code: code,
      p_secret_hash: secretHash,
      p_owner_user_id: user.id,
      p_verified_email: user.email,
    });

    if (error) {
      console.error('GIFT TAG CLAIM ERROR:', error.code || 'database error');
      return NextResponse.json({ error: 'Activation is temporarily unavailable.' }, { status: 503 });
    }

    if (!Array.isArray(data) || data.length !== 1) {
      return errorResponse();
    }

    return NextResponse.json({ ok: true, code });
  } catch (error) {
    console.error('GIFT TAG CLAIM REQUEST ERROR:', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'Could not activate your tag.' }, { status: 500 });
  }
}
