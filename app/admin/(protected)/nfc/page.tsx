import Link from 'next/link';

import CopyMemoryUrlButton from '@/components/admin/CopyMemoryUrlButton';

import {
  getMemoryPublicUrl,
} from '@/lib/memoryUrl';

import {
  normaliseProductionStatus,
  productionStatusLabel,
} from '@/lib/production';

import {
  supabaseAdmin,
} from '@/lib/supabaseAdmin';

export const dynamic =
  'force-dynamic';

type OrderItem = {
  id: string;
  product_type: string;
  product_name: string;
  memory_code: string | null;
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string;
  production_status: string;
  production_data: unknown;
  created_at: string;
  order_items: OrderItem[];
};

type Memory = {
  code: string;
  recipient_name: string;
};

function safeObject(
  value: unknown
): Record<string, any> {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as Record<
      string,
      any
    >;
  }

  return {};
}

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

export default async function AdminNfcPage() {
  const admin =
    supabaseAdmin();

  const {
    data: orderData,
    error: orderError,
  } =
    await admin
      .from('orders')
      .select(
        `
          id,
          order_number,
          customer_name,
          customer_email,
          production_status,
          production_data,
          created_at,
          order_items (
            id,
            product_type,
            product_name,
            memory_code
          )
        `
      )
      .order(
        'created_at',
        {
          ascending: false,
        }
      );

  if (orderError) {
    console.error(
      'ADMIN NFC QUEUE ERROR:',
      orderError
    );

    return (
      <section className="wrap">
        <span className="eyebrow">
          NFC / QR
        </span>

        <h1>
          Programming Queue
        </h1>

        <div className="card">
          Unable to load NFC jobs.
        </div>
      </section>
    );
  }

  const orders =
    (orderData ||
      []) as unknown as Order[];

  const codes =
    Array.from(
      new Set(
        orders.flatMap(
          (order) =>
            order.order_items
              .filter(
                (item) =>
                  item.product_type !==
                  'traditional-card'
              )
              .map(
                (item) =>
                  item.memory_code
                    ?.trim()
                    .toUpperCase()
              )
              .filter(
                (
                  code
                ): code is string =>
                  Boolean(code)
              )
        )
      )
    );

  let memories:
    Memory[] = [];

  if (
    codes.length >
    0
  ) {
    const {
      data,
      error,
    } =
      await admin
        .from('memories')
        .select(
          `
            code,
            recipient_name
          `
        )
        .in(
          'code',
          codes
        );

    if (error) {
      console.error(
        'ADMIN NFC MEMORY ERROR:',
        error
      );
    } else {
      memories =
        (data ||
          []) as Memory[];
    }
  }

  const memoryMap =
    new Map(
      memories.map(
        (memory) => [
          memory.code,
          memory,
        ]
      )
    );

  const jobs =
    orders.flatMap(
      (order) => {
        const productionData =
          safeObject(
            order.production_data
          );

        const savedItems =
          safeObject(
            productionData.items
          );

        return order.order_items
          .filter(
            (item) =>
              item.product_type !==
              'traditional-card'
          )
          .map(
            (item) => {
              const code =
                item.memory_code
                  ?.trim()
                  .toUpperCase() ||
                null;

              const memory =
                code
                  ? memoryMap.get(
                      code
                    )
                  : undefined;

              const savedItem =
                safeObject(
                  savedItems[
                    item.id
                  ]
                );

              const nfc =
                safeObject(
                  savedItem.nfc
                );

              const qr =
                safeObject(
                  savedItem.qr
                );

              const programmed =
                Boolean(
                  nfc.programmed
                );

              const nfcTested =
                Boolean(
                  nfc.tested
                );

              const qrTested =
                Boolean(
                  qr.tested
                );

              const pairingVerified =
                Boolean(
                  nfc.pairingVerified
                );

              const complete =
                pairingVerified &&
                programmed &&
                nfcTested &&
                qrTested;

              let stage =
                'Needs Programming';

              if (
                programmed &&
                !nfcTested
              ) {
                stage =
                  'Needs NFC Test';
              }

              if (
                nfcTested &&
                !qrTested
              ) {
                stage =
                  'Needs QR Test';
              }

              if (complete) {
                stage =
                  'Complete';
              }

              if (
                !code ||
                !memory
              ) {
                stage =
                  'Association Problem';
              }

              return {
                orderId:
                  order.id,

                orderNumber:
                  order.order_number,

                customer:
                  order.customer_name ||
                  order.customer_email,

                productionStatus:
                  normaliseProductionStatus(
                    order.production_status
                  ),

                createdAt:
                  order.created_at,

                itemId:
                  item.id,

                productName:
                  item.product_name,

                memoryCode:
                  code,

                recipient:
                  memory
                    ?.recipient_name ||
                  null,

                url:
                  code &&
                  memory
                    ? getMemoryPublicUrl(
                        code
                      )
                    : null,

                pairingVerified,
                programmed,
                nfcTested,
                qrTested,
                complete,
                stage,
              };
            }
          );
      }
    );

  const activeJobs =
    jobs.filter(
      (job) =>
        !job.complete
    );

  const completedJobs =
    jobs.filter(
      (job) =>
        job.complete
    );

  const associationProblems =
    jobs.filter(
      (job) =>
        job.stage ===
        'Association Problem'
    ).length;

  const needsProgramming =
    jobs.filter(
      (job) =>
        job.stage ===
        'Needs Programming'
    ).length;

  const needsTesting =
    jobs.filter(
      (job) =>
        job.stage ===
          'Needs NFC Test' ||
        job.stage ===
          'Needs QR Test'
    ).length;

  return (
    <section className="wrap smAdminNfcQueue">
      <header className="smAdminPageHeading">
        <div>
          <span className="eyebrow">
            PRODUCTION / NFC
          </span>

          <h1>
            NFC & QR Queue
          </h1>

          <p className="lead">
            Program and verify each
            physical Smart Memories
            gift against its exact
            recipient and memory code.
          </p>
        </div>

        <Link
          href="/admin"
          className="btn secondary"
        >
          Dashboard
        </Link>
      </header>

      <div className="smAdminNfcStats">
        <article className="card">
          <span className="eyebrow">
            PROGRAM
          </span>

          <strong>
            {needsProgramming}
          </strong>

          <span>
            Need NFC programming
          </span>
        </article>

        <article className="card">
          <span className="eyebrow">
            TEST
          </span>

          <strong>
            {needsTesting}
          </strong>

          <span>
            Need NFC / QR test
          </span>
        </article>

        <article className="card">
          <span className="eyebrow">
            ISSUE
          </span>

          <strong>
            {associationProblems}
          </strong>

          <span>
            Association problems
          </span>
        </article>

        <article className="card">
          <span className="eyebrow">
            COMPLETE
          </span>

          <strong>
            {completedJobs.length}
          </strong>

          <span>
            NFC / QR complete
          </span>
        </article>
      </div>

      <section className="smAdminDetailSection">
        <span className="eyebrow">
          ACTION REQUIRED
        </span>

        <h2>
          Active NFC Jobs
        </h2>

        {activeJobs.length ===
        0 ? (
          <div className="card">
            <h3>
              No NFC work waiting
            </h3>

            <p>
              All current Smart
              Memories products have
              completed their NFC and
              QR checks.
            </p>
          </div>
        ) : (
          <div className="smAdminNfcJobList">
            {activeJobs.map(
              (job) => (
                <article
                  key={`${job.orderId}-${job.itemId}`}
                  className="smAdminNfcJob"
                >
                  <div className="smAdminNfcJobHeader">
                    <div>
                      <span className="eyebrow">
                        ORDER{' '}
                        {
                          job.orderNumber
                        }
                      </span>

                      <h3>
                        {
                          job.productName
                        }
                      </h3>

                      <p>
                        {
                          job.customer
                        }
                        {' - '}
                        {formatDate(
                          job.createdAt
                        )}
                      </p>
                    </div>

                    <span
                      className={
                        job.stage ===
                        'Association Problem'
                          ? 'smAdminGateBlocked'
                          : 'smAdminStatus'
                      }
                    >
                      {
                        job.stage
                      }
                    </span>
                  </div>

                  <div className="smAdminNfcJobGrid">
                    <div>
                      <span>
                        Recipient
                      </span>

                      <strong>
                        {job.recipient ||
                          'Not available'}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Memory Code
                      </span>

                      <strong>
                        {job.memoryCode ||
                          'Missing'}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Production
                      </span>

                      <strong>
                        {productionStatusLabel(
                          job.productionStatus
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="smAdminNfcMiniChecks">
                    <span>
                      {job.pairingVerified
                        ? '✓'
                        : '○'}{' '}
                      Pairing
                    </span>

                    <span>
                      {job.programmed
                        ? '✓'
                        : '○'}{' '}
                      Programmed
                    </span>

                    <span>
                      {job.nfcTested
                        ? '✓'
                        : '○'}{' '}
                      NFC Tested
                    </span>

                    <span>
                      {job.qrTested
                        ? '✓'
                        : '○'}{' '}
                      QR Tested
                    </span>
                  </div>

                  {job.url && (
                    <div className="smAdminCanonicalUrl">
                      <span>
                        Exact production URL
                      </span>

                      <code>
                        {job.url}
                      </code>
                    </div>
                  )}

                  <div className="smAdminOrderActions">
                    <Link
                      href={`/admin/orders/${job.orderId}`}
                      className="btn"
                    >
                      Open Order
                    </Link>

                    {job.url && (
                      <>
                        <CopyMemoryUrlButton
                          url={
                            job.url
                          }
                        />

                        <a
                          href={
                            job.url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="btn secondary"
                        >
                          Test Memory
                        </a>
                      </>
                    )}
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>

      <section className="smAdminDetailSection">
        <span className="eyebrow">
          COMPLETED
        </span>

        <h2>
          Verified NFC Jobs
        </h2>

        {completedJobs.length ===
        0 ? (
          <div className="card">
            No completed NFC jobs yet.
          </div>
        ) : (
          <div className="smAdminCompletedNfcList">
            {completedJobs.map(
              (job) => (
                <article
                  key={`${job.orderId}-${job.itemId}`}
                  className="smAdminCompletedNfcJob"
                >
                  <div>
                    <strong>
                      {
                        job.productName
                      }
                    </strong>

                    <span>
                      {
                        job.orderNumber
                      }
                    </span>
                  </div>

                  <div>
                    <strong>
                      {
                        job.recipient
                      }
                    </strong>

                    <code>
                      {
                        job.memoryCode
                      }
                    </code>
                  </div>

                  <span className="smAdminGateReady">
                    VERIFIED
                  </span>

                  <Link
                    href={`/admin/orders/${job.orderId}`}
                    className="btn secondary"
                  >
                    View
                  </Link>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </section>
  );
}