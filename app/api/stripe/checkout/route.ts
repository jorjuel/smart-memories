import {
  NextResponse,
} from 'next/server';

import {
  supabaseAdmin,
} from '@/lib/supabaseAdmin';

import {
  getStripe,
} from '@/lib/stripe';

export const runtime =
  'nodejs';

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const orderId =
      typeof body.orderId === 'string'
        ? body.orderId.trim()
        : '';

    const idempotencyKey =
      typeof body.idempotencyKey === 'string'
        ? body.idempotencyKey.trim()
        : '';

    if (
      !orderId ||
      !idempotencyKey
    ) {
      return NextResponse.json(
        {
          error:
            'Order reference is missing.',
        },
        {
          status: 400,
        }
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
            order_number,
            customer_email,
            subtotal_pence,
            delivery_pence,
            total_pence,
            payment_status,
            idempotency_key
          `
        )
        .eq(
          'id',
          orderId
        )
        .eq(
          'idempotency_key',
          idempotencyKey
        )
        .maybeSingle();

    if (
      orderError ||
      !order
    ) {
      return NextResponse.json(
        {
          error:
            'Order could not be verified.',
        },
        {
          status: 404,
        }
      );
    }

    if (
      order.payment_status ===
      'paid'
    ) {
      return NextResponse.json(
        {
          error:
            'This order has already been paid.',
        },
        {
          status: 409,
        }
      );
    }

    const {
      data: items,
      error: itemsError,
    } =
      await admin
        .from('order_items')
        .select(
          `
            product_name,
            quantity,
            unit_price_pence
          `
        )
        .eq(
          'order_id',
          order.id
        );

    if (
      itemsError ||
      !items ||
      items.length === 0
    ) {
      throw (
        itemsError ||
        new Error(
          'Order items could not be loaded.'
        )
      );
    }

    const itemTotal =
      items.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.unit_price_pence
          ) *
            Number(
              item.quantity
            ),
        0
      );

    if (
      itemTotal !==
      Number(
        order.subtotal_pence
      )
    ) {
      throw new Error(
        'Stored order subtotal does not match its items.'
      );
    }

    if (
      itemTotal +
        Number(
          order.delivery_pence
        ) !==
      Number(
        order.total_pence
      )
    ) {
      throw new Error(
        'Stored order total is inconsistent.'
      );
    }

    const lineItems =
      items.map(
        (item) => ({
          price_data: {
            currency:
              'gbp',

            product_data: {
              name:
                item.product_name ||
                'Smart Memories Gift',
            },

            unit_amount:
              Number(
                item.unit_price_pence
              ),
          },

          quantity:
            Number(
              item.quantity
            ),
        })
      );

    if (
      Number(
        order.delivery_pence
      ) > 0
    ) {
      lineItems.push({
        price_data: {
          currency:
            'gbp',

          product_data: {
            name:
              'Delivery',
          },

          unit_amount:
            Number(
              order.delivery_pence
            ),
        },

        quantity: 1,
      });
    }

    const stripe =
      getStripe();

    const origin =
      new URL(
        request.url
      ).origin;

    const session =
      await stripe
        .checkout
        .sessions
        .create(
          {
            mode:
              'payment',

            client_reference_id:
              order.id,

            customer_email:
              order.customer_email,

            line_items:
              lineItems,

            success_url:
              `${origin}/checkout?payment=success&session_id={CHECKOUT_SESSION_ID}`,

            cancel_url:
              `${origin}/checkout?payment=cancelled&order=${encodeURIComponent(
                order.order_number
              )}`,

            metadata: {
              order_id:
                order.id,

              order_number:
                order.order_number,
            },

            payment_intent_data: {
              metadata: {
                order_id:
                  order.id,

                order_number:
                  order.order_number,
              },
            },
          },
          {
            idempotencyKey:
              `checkout-${order.id}`,
          }
        );

    if (!session.url) {
      throw new Error(
        'Stripe Checkout URL was not created.'
      );
    }

    return NextResponse.json({
      ok: true,
      url:
        session.url,
      sessionId:
        session.id,
      orderNumber:
        order.order_number,
    });
  } catch (error) {
    console.error(
      'STRIPE CHECKOUT ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Could not start payment.',
      },
      {
        status: 500,
      }
    );
  }
}