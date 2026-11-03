import {
  NextResponse,
} from 'next/server';

import Stripe from 'stripe';

import {
  getStripe,
} from '@/lib/stripe';

import {
  supabaseAdmin,
} from '@/lib/supabaseAdmin';

export const runtime =
  'nodejs';

function getPaymentIntentId(
  session: Stripe.Checkout.Session
) {
  if (
    typeof session.payment_intent ===
    'string'
  ) {
    return session.payment_intent;
  }

  return (
    session.payment_intent?.id ||
    null
  );
}

async function markOrderPaid(
  session: Stripe.Checkout.Session
) {
  const orderId =
    session.metadata?.order_id;

  if (!orderId) {
    throw new Error(
      'Stripe session has no order reference.'
    );
  }

  const admin =
    supabaseAdmin();

  const {
    data: order,
    error: orderError,
  } =
    await admin
      .from('orders')
      .select(
        `
          id,
          total_pence,
          payment_status
        `
      )
      .eq(
        'id',
        orderId
      )
      .maybeSingle();

  if (
    orderError ||
    !order
  ) {
    throw (
      orderError ||
      new Error(
        'Order could not be found.'
      )
    );
  }

  if (
    Number(
      session.amount_total
    ) !==
    Number(
      order.total_pence
    )
  ) {
    throw new Error(
      'Stripe payment total does not match the order total.'
    );
  }

  if (
    order.payment_status ===
    'paid'
  ) {
    return;
  }

  const {
    error: updateError,
  } =
    await admin
      .from('orders')
      .update({
        payment_status:
          'paid',

        stripe_checkout_session_id:
          session.id,

        stripe_payment_intent_id:
          getPaymentIntentId(
            session
          ),

        paid_at:
          new Date().toISOString(),
      })
      .eq(
        'id',
        orderId
      );

  if (updateError) {
    throw updateError;
  }
}

export async function POST(
  request: Request
) {
  const webhookSecret =
    process.env
      .STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      {
        error:
          'Stripe webhook secret is not configured.',
      },
      {
        status: 500,
      }
    );
  }

  const signature =
    request.headers.get(
      'stripe-signature'
    );

  if (!signature) {
    return NextResponse.json(
      {
        error:
          'Stripe signature is missing.',
      },
      {
        status: 400,
      }
    );
  }

  try {
    const rawBody =
      await request.text();

    const stripe =
      getStripe();

    const event =
      stripe.webhooks
        .constructEvent(
          rawBody,
          signature,
          webhookSecret
        );

    if (
      event.type ===
      'checkout.session.completed'
    ) {
      const session =
        event.data
          .object as Stripe.Checkout.Session;

      if (
        session.payment_status ===
        'paid'
      ) {
        await markOrderPaid(
          session
        );
      }
    }

    if (
      event.type ===
      'checkout.session.async_payment_succeeded'
    ) {
      const session =
        event.data
          .object as Stripe.Checkout.Session;

      await markOrderPaid(
        session
      );
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      'STRIPE WEBHOOK ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Webhook processing failed.',
      },
      {
        status: 400,
      }
    );
  }
}