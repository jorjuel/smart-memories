import Link from 'next/link';

import {
  redirect,
} from 'next/navigation';

import {
  createSupabaseServerClient,
} from '../../lib/supabaseServer';

import {
  supabaseAdmin,
} from '../../lib/supabaseAdmin';

import {
  getCustomerMemories,
  type CustomerMemory,
} from '../../lib/customerMemories';

import AccountNav from '../../components/AccountNav';
import MemoryCard from '../../components/MemoryCard';

export const dynamic =
  'force-dynamic';

type RecentOrder = {
  id: string;
  order_number: string;
  total_pence: number;
  status: string;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    memory_code: string | null;
  }[];
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

export default async function AccountPage() {
  const supabase =
    await createSupabaseServerClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth
      .getUser();

  if (!user) {
    redirect(
      '/account/login'
    );
  }

  let memories:
    CustomerMemory[] = [];

  let recentOrders:
    RecentOrder[] = [];

  try {
    memories =
      await getCustomerMemories(
        user.id
      );

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
            status,
            created_at,
            order_items (
              id,
              product_name,
              memory_code
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
            ascending: false,
          }
        )
        .limit(3);

    if (error) {
      throw error;
    }

    recentOrders =
      (data ||
        []) as RecentOrder[];
  } catch (
    error
  ) {
    console.error(
      'ACCOUNT DASHBOARD ERROR:',
      error
    );
  }

  const recentMemories =
    memories.slice(
      0,
      3
    );

  return (
    <main className="smAccountPage">
      <AccountNav />

      <section className="smAccountHero">
        <div>
          <span className="v14Eyebrow">
            MY ACCOUNT
          </span>

          <h1>
            Welcome back.
          </h1>

          <p>
            Your Smart Memories,
            gifts and orders all
            live here.
          </p>

          <small>
            Signed in as{' '}
            {user.email}
          </small>
        </div>

        <Link
          href="/create"
          className="btn big"
        >
          Create a New Smart
          Memory
        </Link>
      </section>

      <section className="smAccountOverview">
        <article>
          <strong>
            {
              memories.length
            }
          </strong>

          <span>
            {memories.length ===
            1
              ? 'Smart Memory'
              : 'Smart Memories'}
          </span>

          <Link href="/memories">
            View Memories →
          </Link>
        </article>

        <article>
          <strong>
            {
              recentOrders.length
            }
          </strong>

          <span>
            Recent Orders
          </span>

          <Link href="/account/orders">
            View Orders →
          </Link>
        </article>

        <article>
          <strong>
            ♡
          </strong>

          <span>
            Create another
            moment
          </span>

          <Link href="/create">
            Create Memory →
          </Link>
        </article>
      </section>

      <section className="smAccountSection">
        <div className="smAccountSectionHeading">
          <div>
            <span className="v14Eyebrow">
              YOUR MEMORIES
            </span>

            <h2>
              Continue your
              memories.
            </h2>
          </div>

          <Link
            href="/memories"
            className="btn secondary"
          >
            View All Memories
          </Link>
        </div>

        {recentMemories.length ===
        0 ? (
          <div className="smAccountEmptyCard">
            <h3>
              Your memories will
              appear here.
            </h3>

            <p>
              Create your first
              Smart Memory and
              make a gift they
              can tap and relive.
            </p>

            <Link
              href="/create"
              className="btn"
            >
              Create My First
              Memory
            </Link>
          </div>
        ) : (
          <div className="smMemoryLibraryGrid">
            {recentMemories.map(
              (
                memory
              ) => (
                <MemoryCard
                  key={
                    memory.code
                  }
                  memory={
                    memory
                  }
                />
              )
            )}
          </div>
        )}
      </section>

      <section className="smAccountSection">
        <div className="smAccountSectionHeading">
          <div>
            <span className="v14Eyebrow">
              RECENT ORDERS
            </span>

            <h2>
              Your Smart Gifts.
            </h2>
          </div>

          <Link
            href="/account/orders"
            className="btn secondary"
          >
            View All Orders
          </Link>
        </div>

        {recentOrders.length ===
        0 ? (
          <div className="smAccountEmptyCard">
            <h3>
              No orders yet.
            </h3>

            <p>
              When you order a
              Smart Gift it will
              appear here.
            </p>

            <Link
              href="/shop"
              className="btn"
            >
              Explore Smart Gifts
            </Link>
          </div>
        ) : (
          <div className="smAccountRecentOrders">
            {recentOrders.map(
              (
                order
              ) => (
                <article
                  key={
                    order.id
                  }
                >
                  <div>
                    <span className="eyebrow">
                      {
                        order.order_number
                      }
                    </span>

                    <h3>
                      {statusLabel(
                        order.status
                      )}
                    </h3>

                    <p>
                      {formatDate(
                        order.created_at
                      )}
                    </p>
                  </div>

                  <div className="smAccountOrderRight">
                    <strong>
                      {money(
                        order.total_pence
                      )}
                    </strong>

                    <span>
                      {
                        order
                          .order_items
                          .length
                      }{' '}
                      {order
                        .order_items
                        .length ===
                      1
                        ? 'item'
                        : 'items'}
                    </span>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>

      <section className="smAccountFooterActions">
        <Link
          href="/account/logout"
          className="btn secondary"
        >
          Sign Out
        </Link>
      </section>
    </main>
  );
}