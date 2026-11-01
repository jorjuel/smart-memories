import Link from 'next/link';

import {
  supabaseAdmin,
} from '@/lib/supabaseAdmin';

export const dynamic =
  'force-dynamic';

type ProductionStatus =
  | 'new'
  | 'content_check'
  | 'ready_for_production'
  | 'in_production'
  | 'nfc_programming'
  | 'quality_check'
  | 'ready_to_dispatch'
  | 'dispatched'
  | 'on_hold';

type StatusRow = {
  id: string;
  production_status:
    ProductionStatus;
};

type DashboardOrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  memory_code: string | null;
};

type DashboardOrder = {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string;
  payment_status: string;
  production_status:
    ProductionStatus;
  created_at: string;
  order_items:
    DashboardOrderItem[];
};

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    'en-GB',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  ).format(
    new Date(value)
  );
}

function productionLabel(
  status: ProductionStatus
) {
  switch (status) {
    case 'content_check':
      return 'Content Check';

    case 'ready_for_production':
      return 'Ready for Production';

    case 'in_production':
      return 'In Production';

    case 'nfc_programming':
      return 'NFC Programming';

    case 'quality_check':
      return 'Quality Check';

    case 'ready_to_dispatch':
      return 'Ready to Dispatch';

    case 'dispatched':
      return 'Dispatched';

    case 'on_hold':
      return 'On Hold';

    default:
      return 'New';
  }
}

function paymentLabel(
  status: string
) {
  switch (status) {
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

export default async function AdminDashboardPage() {
  const admin =
    supabaseAdmin();

  const [
    statusResult,
    recentResult,
  ] =
    await Promise.all([
      admin
        .from('orders')
        .select(
          `
            id,
            production_status
          `
        ),

      admin
        .from('orders')
        .select(
          `
            id,
            order_number,
            customer_name,
            customer_email,
            payment_status,
            production_status,
            created_at,
            order_items (
              id,
              product_name,
              quantity,
              memory_code
            )
          `
        )
        .order(
          'created_at',
          {
            ascending: false,
          }
        )
        .limit(8),
    ]);

  if (
    statusResult.error ||
    recentResult.error
  ) {
    console.error(
      'ADMIN DASHBOARD ERROR:',
      statusResult.error ||
        recentResult.error
    );

    return (
      <section className="wrap">
        <span className="eyebrow">
          OWNER DASHBOARD
        </span>

        <h1>
          Smart Memories Operations
        </h1>

        <div className="card">
          <h2>
            Dashboard unavailable
          </h2>

          <p>
            We could not load the
            current production data.
            Please try again.
          </p>
        </div>
      </section>
    );
  }

  const statuses =
    (statusResult.data ||
      []) as StatusRow[];

  const recentOrders =
    (recentResult.data ||
      []) as unknown as
      DashboardOrder[];

  const count =
    (
      status:
        ProductionStatus
    ) =>
      statuses.filter(
        (order) =>
          order.production_status ===
          status
      ).length;

  const newOrders =
    count('new');

  const contentCheck =
    count(
      'content_check'
    );

  const readyForProduction =
    count(
      'ready_for_production'
    );

  /*
   * These are all orders that
   * are actively passing through
   * physical production.
   */
  const inProduction =
    count('in_production') +
    count('nfc_programming') +
    count('quality_check');

  const readyToDispatch =
    count(
      'ready_to_dispatch'
    );

  const issues =
    count('on_hold');

  return (
    <section className="wrap">
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          gap: '24px',
          alignItems:
            'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span className="eyebrow">
            OWNER / OPERATIONS
          </span>

          <h1>
            Smart Memories
            Production
          </h1>

          <p className="lead">
            Orders, production,
            Smart Memories, NFC
            programming and dispatch
            in one place.
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="btn"
        >
          View All Orders
        </Link>
      </div>

      <div
        className="stats"
        style={{
          marginTop: '32px',
        }}
      >
        <div className="card">
          <span className="eyebrow">
            NEW
          </span>

          <b>
            {newOrders}
          </b>

          <span>
            New Orders
          </span>
        </div>

        <div className="card">
          <span className="eyebrow">
            REVIEW
          </span>

          <b>
            {contentCheck}
          </b>

          <span>
            Content Check
          </span>
        </div>

        <div className="card">
          <span className="eyebrow">
            READY
          </span>

          <b>
            {readyForProduction}
          </b>

          <span>
            Ready for Production
          </span>
        </div>

        <div className="card">
          <span className="eyebrow">
            MAKING
          </span>

          <b>
            {inProduction}
          </b>

          <span>
            In Production
          </span>
        </div>

        <div className="card">
          <span className="eyebrow">
            DISPATCH
          </span>

          <b>
            {readyToDispatch}
          </b>

          <span>
            Ready to Dispatch
          </span>
        </div>

        <div className="card">
          <span className="eyebrow">
            ATTENTION
          </span>

          <b>
            {issues}
          </b>

          <span>
            On Hold / Issues
          </span>
        </div>
      </div>

      <section
        style={{
          marginTop: '44px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            gap: '20px',
            alignItems:
              'center',
            flexWrap: 'wrap',
            marginBottom:
              '20px',
          }}
        >
          <div>
            <span className="eyebrow">
              LIVE WORK
            </span>

            <h2>
              Recent Orders
            </h2>
          </div>

          <strong>
            {statuses.length}{' '}
            total orders
          </strong>
        </div>

        {recentOrders.length ===
        0 ? (
          <div className="card">
            <h2>
              No orders yet
            </h2>

            <p>
              New customer orders
              will appear here
              automatically.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: '16px',
            }}
          >
            {recentOrders.map(
              (order) => (
                <article
                  key={order.id}
                  className="card"
                >
                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      gap: '24px',
                      alignItems:
                        'flex-start',
                      flexWrap:
                        'wrap',
                    }}
                  >
                    <div>
                      <span className="eyebrow">
                        ORDER{' '}
                        {
                          order.order_number
                        }
                      </span>

                      <h2>
                        {order.customer_name ||
                          order.customer_email}
                      </h2>

                      <p>
                        {formatDate(
                          order.created_at
                        )}
                      </p>
                    </div>

                    <div
                      style={{
                        textAlign:
                          'right',
                      }}
                    >
                      <strong>
                        {productionLabel(
                          order.production_status
                        )}
                      </strong>

                      <p>
                        Payment:{' '}
                        {paymentLabel(
                          order.payment_status
                        )}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop:
                        '18px',
                      display:
                        'grid',
                      gap: '10px',
                    }}
                  >
                    {order.order_items.map(
                      (item) => (
                        <div
                          key={
                            item.id
                          }
                          style={{
                            padding:
                              '12px 14px',
                            border:
                              '1px solid #ead8cf',
                            borderRadius:
                              '12px',
                            background:
                              '#fffaf7',
                          }}
                        >
                          <strong>
                            {
                              item.product_name
                            }
                          </strong>

                          <span
                            style={{
                              marginLeft:
                                '8px',
                            }}
                          >
                            ×{' '}
                            {
                              item.quantity
                            }
                          </span>

                          {item.memory_code ? (
                            <p
                              style={{
                                margin:
                                  '6px 0 0',
                              }}
                            >
                              Memory:{' '}
                              <Link
                                href={`/m/${item.memory_code}`}
                                target="_blank"
                              >
                                {
                                  item.memory_code
                                }
                              </Link>
                            </p>
                          ) : (
                            <p
                              style={{
                                margin:
                                  '6px 0 0',
                              }}
                            >
                              ? No Smart
                              Memory code
                              linked
                            </p>
                          )}
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

      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginTop: '32px',
        }}
      >
        <Link
          href="/admin/orders"
          className="btn"
        >
          All Orders
        </Link>

        <Link
          href="/admin/memories"
          className="btn secondary"
        >
          Memories
        </Link>

        <Link
          href="/admin/nfc"
          className="btn secondary"
        >
          NFC / QR
        </Link>
      </div>
    </section>
  );
}
