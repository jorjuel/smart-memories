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

import {
  getBundlePricePence,
  getCardPricePence,
  getProductPricePence,
  getShippingPricePence,
} from '@/lib/pricing';

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
  personalisationId?: string;
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

    const admin =
      supabaseAdmin();

    const idempotencyKey =
      typeof body.idempotencyKey === 'string'
        ? body.idempotencyKey.trim()
        : '';

    if (idempotencyKey) {
      const {
        data: existingOrder,
        error: existingOrderError,
      } =
        await admin
          .from('orders')
          .select(
            'id, order_number, total_pence'
          )
          .eq(
            'idempotency_key',
            idempotencyKey
          )
          .eq(
            'customer_email',
            customerEmail
          )
          .maybeSingle();

      if (existingOrderError) {
        throw existingOrderError;
      }

      if (existingOrder) {
        return NextResponse.json(
          {
            ok: true,
            orderId:
              existingOrder.id,
            orderNumber:
              existingOrder.order_number,
            totalPence:
              existingOrder.total_pence,
            duplicate: true,
          },
          {
            status: 200,
          }
        );
      }
    }

    const deliveryMethod =
      body.deliveryMethod ===
      'express'
        ? 'express'
        : 'standard';

    const pricedCart =
      await Promise.all(
        cart.map(
          async (item) => {
            const requestedQuantity =
              Number(
                item.quantity ||
                  1
              );

            const quantity =
              Number.isInteger(
                requestedQuantity
              ) &&
              requestedQuantity > 0 &&
              requestedQuantity <= 99
                ? requestedQuantity
                : 1;

            const productType =
              item.productType ||
              'product';

            let unitPricePence:
              number;

            if (
              productType ===
              'product'
            ) {
              if (
                !item.productSlug
              ) {
                throw new Error(
                  'Product reference is missing.'
                );
              }

              if (item.productSlug === 'digital-memory') {
                if (typeof item.memoryCode !== 'string' ||
                    !/^[A-HJ-NP-Z2-9]{8}$/.test(item.memoryCode)) {
                  throw new Error('A valid saved Smart Memory is required.');
                }
                const {data:linkedMemory,error:lookupError} = await admin
                  .from('memories').select('code')
                  .eq('code',item.memoryCode).maybeSingle();
                if (lookupError || !linkedMemory) {
                  throw new Error('This Smart Memory could not be verified.');
                }
              }
              if (item.productSlug === 'memory-tag') {
                const personalisation =
                  item.personalisation && typeof item.personalisation === 'object'
                    ? item.personalisation as Record<string, unknown>
                    : {};
                const allowedBowColours = [
                  'rose-gold', 'champagne', 'ivory', 'blush', 'burgundy', 'sage',
                ];
                if (
                  typeof item.memoryCode !== 'string' ||
                  !/^[A-HJ-NP-Z2-9]{8}$/.test(item.memoryCode) ||
                  !allowedBowColours.includes(String(personalisation.bowColourId || ''))
                ) {
                  throw new Error('Select a saved memory and valid bow colour before ordering a memory tag.');
                }
                const { data: linkedMemory, error: memoryLookupError } =
                  await admin.from('memories').select('code')
                    .eq('code', item.memoryCode).maybeSingle();
                if (memoryLookupError || !linkedMemory) {
                  throw new Error('The memory linked to your gift tag could not be verified.');
                }
              }

              unitPricePence =
                getProductPricePence(
                  item.productSlug
                );
            } else if (
              productType ===
              'bundle'
            ) {
              if (
                !item.productSlug
              ) {
                throw new Error(
                  'Bundle reference is missing.'
                );
              }

              unitPricePence =
                getBundlePricePence(
                  item.productSlug
                );
            } else if (
              productType ===
                'smart-card' ||
              productType ===
                'traditional-card'
            ) {
              if (
                !item.personalisationId
              ) {
                throw new Error(
                  'Card personalisation reference is missing.'
                );
              }

              const {
                data:
                  cardPersonalisation,
                error:
                  cardPersonalisationError,
              } =
                await admin
                  .from(
                    'card_personalisations'
                  )
                  .select(
                    `
                      id,
                      card_type,
                      include_printed_photo
                    `
                  )
                  .eq(
                    'id',
                    item.personalisationId
                  )
                  .maybeSingle();

              if (
                cardPersonalisationError ||
                !cardPersonalisation
              ) {
                throw new Error(
                  'Card personalisation could not be verified.'
                );
              }

              const savedCardType =
                cardPersonalisation.card_type ===
                'smart'
                  ? 'smart'
                  : cardPersonalisation.card_type ===
                    'traditional'
                  ? 'traditional'
                  : null;

              if (!savedCardType) {
                throw new Error(
                  'Saved card type is invalid.'
                );
              }

              const expectedProductType =
                savedCardType ===
                'smart'
                  ? 'smart-card'
                  : 'traditional-card';

              if (
                productType !==
                expectedProductType
              ) {
                throw new Error(
                  'Card type does not match the saved personalisation.'
                );
              }

              unitPricePence =
                getCardPricePence(
                  savedCardType,
                  Boolean(
                    cardPersonalisation
                      .include_printed_photo
                  )
                );
            } else {
              throw new Error(
                'Invalid product type.'
              );
            }

            return {
              ...item,
              productType,
              quantity,
              unitPricePence,
            };
          }
        )
      );

    const subtotalPence =
      pricedCart.reduce(
        (
          total,
          item
        ) =>
          total +
          item.unitPricePence *
            item.quantity,
        0
      );

    // Digital-only orders are delivered online: never charge postage.
    const digitalOnly = pricedCart.length > 0 &&
      pricedCart.every(item =>
        item.productType === 'product' && item.productSlug === 'digital-memory');
    const deliveryPence = digitalOnly
      ? 0
      : getShippingPricePence(deliveryMethod);

    const totalPence =
      subtotalPence +
      deliveryPence;

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

          idempotency_key:
            idempotencyKey ||
            null,

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
            deliveryMethod,

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
      if (
        idempotencyKey &&
        orderError?.code === '23505'
      ) {
        const {
          data: duplicateOrder,
          error: duplicateError,
        } =
          await admin
            .from('orders')
            .select(
              'id, order_number, total_pence'
            )
            .eq(
              'idempotency_key',
              idempotencyKey
            )
            .maybeSingle();

        if (duplicateError) {
          throw duplicateError;
        }

        if (duplicateOrder) {
          return NextResponse.json(
            {
              ok: true,
              orderId:
                duplicateOrder.id,
              orderNumber:
                duplicateOrder.order_number,
              totalPence:
                duplicateOrder.total_pence,
              duplicate: true,
            },
            {
              status: 200,
            }
          );
        }
      }

      throw (
        orderError ||
        new Error(
          'Could not create order.'
        )
      );
    }

    const items =
      pricedCart.map(
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
            item.quantity,

          unit_price_pence:
            item.unitPricePence,

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