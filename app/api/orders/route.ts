import {
  NextResponse,
} from 'next/server';

import {
  randomBytes,
} from 'crypto';

import {
  createSupabaseServerClient,
} from '@/lib/supabaseServer';

import {
  supabaseAdmin,
} from '@/lib/supabaseAdmin';

export const runtime =
  'nodejs';

type IncomingCartItem = {
  productType?: string;
  productSlug?: string;
  name?: string;
  quantity?: number;
  price?: number;
  memoryCode?: string | null;
  imageUrl?: string | null;
  personalisation?: unknown;
};

function makeOrderNumber() {
  const year =
    new Date().getFullYear();

  const random =
    randomBytes(3)
      .toString('hex')
      .toUpperCase();

  return `SM-${year}-${random}`;
}

function moneyToPence(
  value: unknown
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    return 0;
  }

  return Math.round(
    number * 100
  );
}

/* =========================================
   CREATE ORDER
   ========================================= */

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const cart =
      Array.isArray(body.cart)
        ? (
            body.cart as IncomingCartItem[]
          )
        : [];

    if (
      cart.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            'Your basket is empty.',
        },
        {
          status: 400,
        }
      );
    }

    const auth =
      await createSupabaseServerClient();

    const {
      data: {
        user,
      },
    } =
      await auth.auth.getUser();

    const customerEmail =
      (
        user?.email ||
        body.email ||
        ''
      )
        .toString()
        .trim()
        .toLowerCase();

    if (!customerEmail) {
      return NextResponse.json(
        {
          error:
            'Customer email is required.',
        },
        {
          status: 400,
        }
      );
    }

    const customerId =
      user?.id ||
      null;

    const subtotalPence =
      cart.reduce(
        (
          total,
          item
        ) => {
          const quantity =
            Math.max(
              1,
              Number(
                item.quantity ||
                  1
              )
            );

          return (
            total +
            moneyToPence(
              item.price
            ) *
              quantity
          );
        },
        0
      );

    const deliveryPence =
      moneyToPence(
        body.deliveryPrice ||
          0
      );

    const totalPence =
      subtotalPence +
      deliveryPence;

    const admin =
      supabaseAdmin();

    const orderNumber =
      makeOrderNumber();

    const {
      data: order,
      error:
        orderError,
    } =
      await admin
        .from('orders')
        .insert({
          order_number:
            orderNumber,

          customer_id:
            customerId,

          customer_email:
            customerEmail,

          customer_name:
            body.customerName ||
            null,

          delivery_name:
            body.deliveryName ||
            body.customerName ||
            null,

          delivery_address_1:
            body.address1 ||
            null,

          delivery_address_2:
            body.address2 ||
            null,

          delivery_city:
            body.city ||
            null,

          delivery_postcode:
            body.postcode ||
            null,

          delivery_method:
            body.deliveryMethod ||
            'standard',

          subtotal_pence:
            subtotalPence,

          delivery_pence:
            deliveryPence,

          total_pence:
            totalPence,

          /*
           * Until Stripe is connected,
           * orders remain pending.
           */
          payment_status:
            'pending',

          status:
            'new',
        })
        .select(
          'id, order_number'
        )
        .single();

    if (
      orderError ||
      !order
    ) {
      throw (
        orderError ||
        new Error(
          'Could not create order.'
        )
      );
    }

    const items =
      cart.map(
        (
          item
        ) => ({
          order_id:
            order.id,

          product_type:
            item.productType ||
            'product',

          product_slug:
            item.productSlug ||
            null,

          product_name:
            item.name ||
            'Smart Memories Gift',

          quantity:
            Math.max(
              1,
              Number(
                item.quantity ||
                  1
              )
            ),

          unit_price_pence:
            moneyToPence(
              item.price
            ),

          memory_code:
            item.memoryCode ||
            null,

          image_url:
            item.imageUrl ||
            null,

          personalisation:
            item.personalisation ||
            null,
        })
      );

    const {
      error:
        itemError,
    } =
      await admin
        .from(
          'order_items'
        )
        .insert(items);

    if (itemError) {
      /*
       * Remove incomplete order
       * if item creation fails.
       */
      await admin
        .from('orders')
        .delete()
        .eq(
          'id',
          order.id
        );

      throw itemError;
    }

    return NextResponse.json(
      {
        ok: true,

        orderId:
          order.id,

        orderNumber:
          order.order_number,

        totalPence,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      'CREATE ORDER ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Could not create order.',
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   CUSTOMER ORDERS
   ========================================= */

export async function GET() {
  try {
    const auth =
      await createSupabaseServerClient();

    const {
      data: {
        user,
      },
    } =
      await auth.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            'Authentication required.',
        },
        {
          status: 401,
        }
      );
    }

    const admin =
      supabaseAdmin();

    const {
      data,
      error,
    } =
      await admin
        .from('orders')
        .select(
          `
            id,
            order_number,
            customer_email,
            total_pence,
            payment_status,
            status,
            created_at,
            order_items (
              id,
              product_type,
              product_slug,
              product_name,
              quantity,
              unit_price_pence,
              memory_code,
              image_url
            )
          `
        )
        .eq(
          'customer_id',
          user.id
        )
        .order(
          'created_at',
          {
            ascending:
              false,
          }
        );

    if (error) {
      throw error;
    }

    return NextResponse.json(
      data || []
    );
  } catch (error) {
    console.error(
      'CUSTOMER ORDERS ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Could not load orders.',
      },
      {
        status: 500,
      }
    );
  }
}