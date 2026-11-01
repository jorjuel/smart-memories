import Link from 'next/link';

import {
  supabaseAdmin,
} from '@/lib/supabaseAdmin';

import {
  normaliseProductionStatus,
  productionStatusLabel,
  productionStatuses,
} from '@/lib/production';

import type {
  ProductionStatus,
} from '@/lib/production';

export const dynamic =
  'force-dynamic';

type SearchParams = Promise<{
  q?: string;
  status?: string;
  issue?: string;
  memory?: string;
  product?: string;
}>;

type OrderItem = {
  id: string;
  product_type: string;
  product_slug: string | null;
  product_name: string;
  quantity: number;
  unit_price_pence: number;
  memory_code: string | null;
  image_url: string | null;
  personalisation: unknown;
};

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string;
  total_pence: number;
  payment_status: string;
  status: string;
  production_status: ProductionStatus;
  created_at: string;
  order_items: OrderItem[];
};

type MemoryRow = {
  code: string;
  recipient_name: string;
  sender_name: string | null;
  photo_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  message: string | null;
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
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  ).format(
    new Date(value)
  );
}

function getOccasion(
  value: unknown
) {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return null;
  }

  const record =
    value as Record<
      string,
      unknown
    >;

  return typeof record.occasion ===
    'string'
    ? record.occasion
    : null;
}

function itemIssues(
  item: OrderItem,
  memory:
    MemoryRow | undefined
) {
  const issues:
    string[] = [];

  /*
   * Traditional cards may legitimately
   * have no Smart Memory.
   */
  const expectsMemory =
    item.product_type !==
      'traditional-card';

  if (
    expectsMemory &&
    !item.memory_code
  ) {
    issues.push(
      'No Smart Memory linked'
    );
  }

  if (
    item.memory_code &&
    !memory
  ) {
    issues.push(
      'Memory code has no matching memory'
    );
  }

  if (memory) {
    if (
      !memory.recipient_name
        ?.trim()
    ) {
      issues.push(
        'Recipient name missing'
      );
    }

    if (!memory.photo_url) {
      issues.push(
        'Main memory photo missing'
      );
    }
  }

  if (
    item.product_type ===
      'product' &&
    !item.product_slug
  ) {
    issues.push(
      'Product configuration incomplete'
    );
  }

  return issues;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params =
    await searchParams;

  const query =
    (params.q || '')
      .trim()
      .toLowerCase();

  const statusFilter =
    (params.status || '')
      .trim();

  const issueFilter =
    params.issue === 'yes';

  const incompleteFilter =
    params.memory ===
      'incomplete';

  const completeFilter =
    params.memory ===
      'complete';

  const productFilter =
    (params.product || '')
      .trim();

  const admin =
    supabaseAdmin();

  const {
    data:
      orderData,
    error:
      orderError,
  } =
    await admin
      .from('orders')
      .select(
        `
          id,
          order_number,
          customer_name,
          customer_email,
          total_pence,
          payment_status,
          status,
          production_status,
          created_at,
          order_items (
            id,
            product_type,
            product_slug,
            product_name,
            quantity,
            unit_price_pence,
            memory_code,
            image_url,
            personalisation
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
      'ADMIN ORDERS ERROR:',
      orderError
    );

    return (
      <section className="wrap">
        <h1>
          Orders
        </h1>

        <div className="card">
          <h2>
            Unable to load orders
          </h2>

          <p>
            Please try again.
          </p>
        </div>
      </section>
    );
  }

  const orders =
    (orderData ||
      []) as unknown as
      OrderRow[];

  const memoryCodes =
    Array.from(
      new Set(
        orders.flatMap(
          (order) =>
            order.order_items
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
    MemoryRow[] = [];

  if (
    memoryCodes.length >
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
            recipient_name,
            sender_name,
            photo_url,
            audio_url,
            video_url,
            message
          `
        )
        .in(
          'code',
          memoryCodes
        );

    if (error) {
      console.error(
        'ADMIN ORDER MEMORIES ERROR:',
        error
      );
    } else {
      memories =
        (data ||
          []) as MemoryRow[];
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

  const productNames =
    Array.from(
      new Set(
        orders.flatMap(
          (order) =>
            order.order_items.map(
              (item) =>
                item.product_name
            )
        )
      )
    ).sort(
      (a, b) =>
        a.localeCompare(b)
    );

  const prepared =
    orders.map(
      (order) => {
        const status =
          normaliseProductionStatus(
            order.production_status
          );

        const items =
          order.order_items.map(
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

              const issues =
                itemIssues(
                  item,
                  memory
                );

              return {
                ...item,
                memoryCode:
                  code,
                memory,
                issues,
                occasion:
                  getOccasion(
                    item.personalisation
                  ),
              };
            }
          );

        const issues =
          items.flatMap(
            (item) =>
              item.issues
          );

        if (
          status ===
          'on_hold'
        ) {
          issues.unshift(
            'Order is on hold'
          );
        }

        const memoryComplete =
          items.length >
            0 &&
          items.every(
            (item) => {
              if (
                item.product_type ===
                'traditional-card'
              ) {
                return true;
              }

              return (
                Boolean(
                  item.memoryCode
                ) &&
                Boolean(
                  item.memory
                ) &&
                Boolean(
                  item.memory
                    ?.recipient_name
                ) &&
                Boolean(
                  item.memory
                    ?.photo_url
                )
              );
            }
          );

        return {
          ...order,
          production_status:
            status,
          items,
          issues,
          memoryComplete,
        };
      }
    );

  const filtered =
    prepared.filter(
      (order) => {
        if (
          statusFilter &&
          order.production_status !==
            statusFilter
        ) {
          return false;
        }

        if (
          issueFilter &&
          order.issues.length ===
            0
        ) {
          return false;
        }

        if (
          incompleteFilter &&
          order.memoryComplete
        ) {
          return false;
        }

        if (
          completeFilter &&
          !order.memoryComplete
        ) {
          return false;
        }

        if (
          productFilter &&
          !order.items.some(
            (item) =>
              item.product_name ===
              productFilter
          )
        ) {
          return false;
        }

        if (!query) {
          return true;
        }

        const searchable =
          [
            order.order_number,
            order.customer_name,
            order.customer_email,
            ...order.items.flatMap(
              (item) => [
                item.product_name,
                item.memoryCode,
                item.memory
                  ?.recipient_name,
                item.memory
                  ?.sender_name,
                item.occasion,
              ]
            ),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchable.includes(
          query
        );
      }
    );

  return (
    <section className="wrap smAdminOrdersPage">
      <div className="smAdminPageHeading">
        <div>
          <span className="eyebrow">
            OWNER / PRODUCTION
          </span>

          <h1>
            All Orders
          </h1>

          <p className="lead">
            Match each physical
            product to the correct
            Smart Memory before
            production and dispatch.
          </p>
        </div>

        <Link
          href="/admin"
          className="btn secondary"
        >
          Dashboard
        </Link>
      </div>

      <form
        method="get"
        className="smAdminFilters"
      >
        <label className="smAdminSearch">
          <span>
            Search
          </span>

          <input
            type="search"
            name="q"
            defaultValue={
              params.q || ''
            }
            placeholder="Order, customer, memory code, recipient or product"
          />
        </label>

        <label>
          <span>
            Production status
          </span>

          <select
            name="status"
            defaultValue={
              statusFilter
            }
          >
            <option value="">
              All statuses
            </option>

            {productionStatuses.map(
              (status) => (
                <option
                  key={
                    status
                  }
                  value={
                    status
                  }
                >
                  {productionStatusLabel(
                    status
                  )}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          <span>
            Product
          </span>

          <select
            name="product"
            defaultValue={
              productFilter
            }
          >
            <option value="">
              All products
            </option>

            {productNames.map(
              (name) => (
                <option
                  key={name}
                  value={name}
                >
                  {name}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          <span>
            Memory
          </span>

          <select
            name="memory"
            defaultValue={
              params.memory ||
              ''
            }
          >
            <option value="">
              All
            </option>

            <option value="complete">
              Complete
            </option>

            <option value="incomplete">
              Incomplete
            </option>
          </select>
        </label>

        <label>
          <span>
            Issues
          </span>

          <select
            name="issue"
            defaultValue={
              params.issue ||
              ''
            }
          >
            <option value="">
              All
            </option>

            <option value="yes">
              Has issue
            </option>
          </select>
        </label>

        <div className="smAdminFilterActions">
          <button
            type="submit"
            className="btn"
          >
            Apply Filters
          </button>

          <Link
            href="/admin/orders"
            className="btn secondary"
          >
            Clear
          </Link>
        </div>
      </form>

      <div className="smAdminOrderCount">
        <strong>
          {filtered.length}
        </strong>

        <span>
          {filtered.length ===
          1
            ? 'order shown'
            : 'orders shown'}
        </span>
      </div>

      {filtered.length ===
      0 ? (
        <div className="card">
          <h2>
            No matching orders
          </h2>

          <p>
            Try clearing or changing
            the filters.
          </p>
        </div>
      ) : (
        <div className="smAdminOrderList">
          {filtered.map(
            (order) => (
              <article
                key={order.id}
                className="smAdminOrderCard"
              >
                <header className="smAdminOrderHeader">
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
                      {
                        order.customer_email
                      }
                      {' - '}
                      {formatDate(
                        order.created_at
                      )}
                    </p>
                  </div>

                  <div className="smAdminOrderHeaderStatus">
                    <span
                      className={`smAdminStatus smAdminStatus-${order.production_status}`}
                    >
                      {productionStatusLabel(
                        order.production_status
                      )}
                    </span>

                    <strong>
                      {money(
                        order.total_pence
                      )}
                    </strong>

                    <small>
                      Payment:{' '}
                      {
                        order.payment_status
                      }
                    </small>
                  </div>
                </header>

                {order.issues.length >
                  0 && (
                  <div className="smAdminIssueBox">
                    <strong>
                      Needs attention
                    </strong>

                    <ul>
                      {Array.from(
                        new Set(
                          order.issues
                        )
                      ).map(
                        (
                          issue
                        ) => (
                          <li
                            key={
                              issue
                            }
                          >
                            {issue}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                <div className="smAdminOrderItems">
                  {order.items.map(
                    (item) => (
                      <div
                        key={
                          item.id
                        }
                        className="smAdminOrderItem"
                      >
                        <div className="smAdminOrderItemImage">
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
                              No image
                            </span>
                          )}
                        </div>

                        <div className="smAdminOrderItemInfo">
                          <h3>
                            {
                              item.product_name
                            }
                          </h3>

                          <p>
                            Quantity:{' '}
                            {
                              item.quantity
                            }
                          </p>

                          {item.occasion && (
                            <p>
                              Occasion:{' '}
                              <strong>
                                {
                                  item.occasion
                                }
                              </strong>
                            </p>
                          )}

                          <div className="smAdminMemorySummary">
                            {item.memoryCode ? (
                              <>
                                <strong>
                                  Memory code:{' '}
                                  {
                                    item.memoryCode
                                  }
                                </strong>

                                {item.memory ? (
                                  <>
                                    <span>
                                      For{' '}
                                      {
                                        item.memory
                                          .recipient_name
                                      }
                                    </span>

                                    <span>
                                      Photo:{' '}
                                      {item.memory
                                        .photo_url
                                        ? 'Yes'
                                        : 'No'}
                                      {' | '}
                                      Voice:{' '}
                                      {item.memory
                                        .audio_url
                                        ? 'Yes'
                                        : 'No'}
                                      {' | '}
                                      Video:{' '}
                                      {item.memory
                                        .video_url
                                        ? 'Yes'
                                        : 'No'}
                                      {' | '}
                                      Message:{' '}
                                      {item.memory
                                        .message
                                        ? 'Yes'
                                        : 'No'}
                                    </span>
                                  </>
                                ) : (
                                  <span className="smAdminDangerText">
                                    Matching memory not found
                                  </span>
                                )}
                              </>
                            ) : (
                              <strong className="smAdminDangerText">
                                No Smart Memory code
                              </strong>
                            )}
                          </div>

                          <div className="smAdminOrderActions">
                            {item.memoryCode &&
                              item.memory && (
                              <Link
                                href={`/m/${item.memoryCode}`}
                                target="_blank"
                                className="btn secondary"
                              >
                                View Memory
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <footer className="smAdminOrderFooter">
                  <div>
                    <strong>
                      Memory status:
                    </strong>
                    {' '}
                    {order.memoryComplete
                      ? 'Complete'
                      : 'Review required'}
                  </div>

                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="btn"
                  >
                    Open Order
                  </Link>
                </footer>
              </article>
            )
          )}
        </div>
      )}
    </section>
  );
}