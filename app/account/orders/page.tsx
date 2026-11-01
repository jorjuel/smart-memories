import Link from 'next/link';

import {
  redirect,
} from 'next/navigation';

import {
  createSupabaseServerClient,
} from '../../../lib/supabaseServer';

import {
  supabaseAdmin,
} from '../../../lib/supabaseAdmin';

import {
  products,
} from '../../../lib/products';

import {
  getProductExperience,
} from '../../../lib/productExperience';

import AccountNav from '../../../components/AccountNav';

export const dynamic =
  'force-dynamic';

type OrderItem = {
  id: string;
  product_slug: string | null;
  product_name: string;
  quantity: number;
  unit_price_pence: number;
  memory_code: string | null;
  image_url: string | null;
};

type Order = {
  id: string;
  order_number: string;
  total_pence: number;
  payment_status: string;
  status: string;
  created_at: string;
  order_items:
    OrderItem[];
};

function money(
  pence: number
) {
  return new Intl.NumberFormat(
    'en-GB',
    {
      style: 'currency',
      currency: 'GBP',
    }
  ).format(
    pence / 100
  );
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    'en-GB',
    {
      dateStyle:
        'medium',
    }
  ).format(
    new Date(value)
  );
}

function statusLabel(
  value: string
) {
  switch (value) {
    case 'in_production':
      return 'In Production';

    case 'nfc_programmed':
      return 'NFC Programmed';

    case 'ready_to_dispatch':
      return 'Ready to Dispatch';

    case 'dispatched':
      return 'Dispatched';

    case 'completed':
      return 'Completed';

    case 'cancelled':
      return 'Cancelled';

    default:
      return 'New';
  }
}

function paymentLabel(
  value: string
) {
  switch (value) {
    case 'paid':
      return 'Paid';

    case 'failed':
      return 'Payment Failed';

    case 'refunded':
      return 'Refunded';

    default:
      return 'Pending';
  }
}

function customerProductName(
  item: OrderItem
) {
  if (
    !item.product_slug
  ) {
    return item.product_name;
  }

  const exists =
    products.some(
      (product) =>
        product.slug ===
        item.product_slug
    );

  if (!exists) {
    return item.product_name;
  }

  return getProductExperience(
    item.product_slug
  ).marketingName;
}

export default async function CustomerOrdersPage() {
  const auth =
    await createSupabaseServerClient();

  const {
    data: {
      user,
    },
  } =
    await auth.auth
      .getUser();

  if (!user) {
    redirect(
      '/account/login'
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
          total_pence,
          payment_status,
          status,
          created_at,
          order_items (
            id,
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

  const orders =
    (data ||
      []) as Order[];

  return (
    <main className="smAccountPage">
      <AccountNav />

      <section className="smOrdersHero">
        <div>
          <span className="v14Eyebrow">
            YOUR SMART GIFTS
          </span>

          <h1>
            My Orders
          </h1>

          <p>
            Track your physical
            Smart Gifts and open
            the memories connected
            to them.
          </p>
        </div>

        <Link
          href="/create"
          className="btn big"
        >
          Create a New Memory
        </Link>
      </section>

      {error && (
        <section className="smMemoryLoadError">
          <h2>
            We couldn't load
            your orders.
          </h2>

          <p>
            Please try again.
          </p>

          <Link
            href="/account/orders"
            className="btn"
          >
            Try Again
          </Link>
        </section>
      )}

      {!error &&
        orders.length ===
          0 && (
          <section className="smMemoryEmpty">
            <div className="smMemoryEmptyIcon">
              ♡
            </div>

            <span className="v14Eyebrow">
              YOUR ORDERS
            </span>

            <h2>
              Your Smart Gifts
              will appear here.
            </h2>

            <p>
              When you purchase a
              Smart Memories gift,
              you can follow its
              progress from this
              page.
            </p>

            <Link
              href="/shop"
              className="btn big"
            >
              Explore Smart Gifts
            </Link>
          </section>
        )}

      {!error &&
        orders.length >
          0 && (
          <section className="smOrdersList">
            {orders.map(
              (
                order
              ) => (
                <article
                  key={
                    order.id
                  }
                  className="smOrderCard"
                >
                  <header className="smOrderCardHeader">
                    <div>
                      <span className="eyebrow">
                        ORDER{' '}
                        {
                          order.order_number
                        }
                      </span>

                      <h2>
                        {statusLabel(
                          order.status
                        )}
                      </h2>

                      <p>
                        Ordered{' '}
                        {formatDate(
                          order.created_at
                        )}
                      </p>
                    </div>

                    <div className="smOrderCardSummary">
                      <strong>
                        {money(
                          order.total_pence
                        )}
                      </strong>

                      <span>
                        Payment:{' '}
                        {paymentLabel(
                          order.payment_status
                        )}
                      </span>
                    </div>
                  </header>

                  <div className="smOrderItems">
                    {order.order_items.map(
                      (
                        item
                      ) => (
                        <div
                          key={
                            item.id
                          }
                          className="smOrderItem"
                        >
                          <div className="smOrderItemImage">
                            {item.image_url ? (
                              <img
                                src={
                                  item.image_url
                                }
                                alt=""
                                loading="lazy"
                              />
                            ) : (
                              <span>
                                ♡
                              </span>
                            )}
                          </div>

                          <div className="smOrderItemInfo">
                            <h3>
                              {customerProductName(
                                item
                              )}
                            </h3>

                            <p>
                              Quantity:{' '}
                              {
                                item.quantity
                              }
                            </p>

                            <p>
                              {money(
                                item.unit_price_pence
                              )}{' '}
                              each
                            </p>

                            <div className="smOrderItemActions">
                              {item.memory_code && (
                                <>
                                  <Link
                                    href={`/memories/${item.memory_code}`}
                                    className="btn"
                                  >
                                    View Smart
                                    Memory
                                  </Link>

                                  <Link
                                    href={`/m/${item.memory_code}`}
                                    className="btn secondary"
                                  >
                                    Recipient
                                    View
                                  </Link>
                                </>
                              )}

                              {item.product_slug &&
                                products.some(
                                  (
                                    product
                                  ) =>
                                    product.slug ===
                                    item.product_slug
                                ) && (
                                  <Link
                                    href={`/shop/${item.product_slug}`}
                                    className="smOrderProductLink"
                                  >
                                    View Gift
                                  </Link>
                                )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </article>
              )
            )}
          </section>
        )}
    </main>
  );
}