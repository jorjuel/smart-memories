import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Confirm payment with Stripe, not a customer-editable URL parameter.
 * The webhook remains authoritative for marking orders paid in Supabase.
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('session_id') || '';
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id) || id.length > 255) {
    return NextResponse.json({status:'invalid'}, {status:400, headers:{'Cache-Control':'no-store'}});
  }
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(id);
    const orderId = session.metadata?.order_id;
    if (!orderId || session.client_reference_id !== orderId) {
      return NextResponse.json({status:'invalid'}, {status:400, headers:{'Cache-Control':'no-store'}});
    }
    const admin = supabaseAdmin();
    const {data:order,error} = await admin
      .from('orders')
      .select('id,total_pence,payment_status,stripe_checkout_session_id')
      .eq('id',orderId).maybeSingle();
    if (error || !order) {
      return NextResponse.json({status:'pending'}, {headers:{'Cache-Control':'no-store'}});
    }
    const totalMatches = session.currency === 'gbp' &&
      Number(session.amount_total) === Number(order.total_pence);
    if (!totalMatches) {
      return NextResponse.json({status:'invalid'}, {status:400, headers:{'Cache-Control':'no-store'}});
    }
    const stripePaid = session.payment_status === 'paid' && session.status === 'complete';
    const dbPaid = order.payment_status === 'paid' &&
      (!order.stripe_checkout_session_id || order.stripe_checkout_session_id === id);
    // A verified paid Stripe session confirms payment even if webhook delivery is delayed.
    const paid = stripePaid && (dbPaid || order.payment_status === 'pending');
    return NextResponse.json(
      {status:paid ? 'paid' : 'pending'},
      {headers:{'Cache-Control':'no-store'}}
    );
  } catch (error) {
    console.error('VERIFY STRIPE PAYMENT:',error);
    return NextResponse.json({status:'unavailable'}, {
      status:503, headers:{'Cache-Control':'no-store'}
    });
  }
}
