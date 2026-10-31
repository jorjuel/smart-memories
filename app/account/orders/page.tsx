import Link from 'next/link';

import {
  redirect,
} from 'next/navigation';

import {
  createSupabaseServerClient,
} from '../../../lib/supabaseServer';

export const dynamic =
  'force-dynamic';

export default async function CustomerOrdersPage() {
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

  return (
    <section className="wrap">
      <span className="eyebrow">
        MY ACCOUNT
      </span>

      <h1>
        My Orders
      </h1>

      <p className="lead">
        Your Smart Memories orders
        will appear here.
      </p>

      <div className="card">
        <h2>
          No orders yet
        </h2>

        <p>
          Once checkout and payment
          are fully connected, your
          completed purchases will
          appear here automatically.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            marginTop: '18px',
          }}
        >
          <Link
            href="/shop"
            className="btn"
          >
            Browse Gifts
          </Link>

          <Link
            href="/account"
            className="btn secondary"
          >
            Back to My Account
          </Link>
        </div>
      </div>
    </section>
  );
}