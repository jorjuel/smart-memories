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

export const dynamic =
  'force-dynamic';

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
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
            product_name,
            quantity,
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
    (data || []) as Order[];

  return (
    <section className="wrap">
      <div className="titleRow">
        <div>
          <span className="eyebrow">
            MY ACCOUNT
          </span>

          <h1>
            My Orders
          </h1>

          <p className="lead">
            Track your Smart Memories
            purchases and production.
          </p>
        </div>

        <Link
          href="/account"
          className="btn secondary"
        >
          My Account
        </Link>
      </div>

      {error && (
        <div className="card">
          <p>
            We could not load your
            orders.
          </p>
        </div>
      )}

      {!error &&
        orders.length ===
          0 && (
          <div className="card">
            <h2>
              No orders yet
            </h2>

            <p>
              When you purchase a
              Smart Memories gift,
              your order will appear
              here.
            </p>

            <Link
              href="/shop"
              className="btn"
            >
              Browse Gifts
            </Link>
          </div>
        )}

      {!error &&
        orders.length >
          0 && (
          <div
            style={{
              display:
                'grid',
              gap: '20px',
            }}
          >
            {orders.map(
              (
                order
              ) => (
                <article
                  className="card"
                  key={
                    order.id
                  }
                >
                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      gap:
                        '20px',
                      flexWrap:
                        'wrap',
                    }}
                  >
                    <div>
                      <span className="eyebrow">
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

                    <div>
                      <strong>
                        {money(
                          order.total_pence
                        )}
                      </strong>

                      <p>
                        Payment:{' '}
                        {
                          order.payment_status
                        }
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop:
                        '20px',
                      display:
                        'grid',
                      gap:
                        '12px',
                    }}
                  >
                    {order.order_items.map(
                      (
                        item
                      ) => (
                        <div
                          key={
                            item.id
                          }
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            gap:
                              '14px',
                            borderTop:
                              '1px solid #eee',
                            paddingTop:
                              '14px',
                          }}
                        >
                          {item.image_url && (
                            <img
                              src={
                                item.image_url
                              }
                              alt=""
                              style={{
                                width:
                                  '70px',
                                height:
                                  '70px',
                                objectFit:
                                  'cover',
                                borderRadius:
                                  '10px',
                              }}
                            />
                          )}

                          <div>
                            <strong>
                              {
                                item.product_name
                              }
                            </strong>

                            <p>
                              Qty:{' '}
                              {
                                item.quantity
                              }
                            </p>

                            {item.memory_code && (
                              <Link
                                href={`/m/${item.memory_code}`}
                              >
                                View Smart Memory
                              </Link>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </article>
              )
            )}
          </div>
        )}
    </section>
  );
}