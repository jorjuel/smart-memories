import Link from 'next/link';

import {
  redirect,
} from 'next/navigation';

import {
  createSupabaseServerClient,
} from '../../lib/supabaseServer';

export const dynamic =
  'force-dynamic';

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

  /*
   * CUSTOMER ACCOUNT ONLY
   *
   * No customer session:
   * go to customer login.
   *
   * IMPORTANT:
   * This page NEVER redirects
   * anybody to /admin.
   */
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
        Welcome to Smart Memories
      </h1>

      <p className="lead">
        Signed in as {user.email}
      </p>

      <div className="dashgrid">
        <Link
          className="card dashlink"
          href="/memories"
        >
          <strong>
            Memories
          </strong>

          <h2>
            My Memories
          </h2>

          <p>
            View the Smart Memories
            linked to your customer
            account.
          </p>
        </Link>

        <Link
  className="card dashlink"
  href="/account/orders"
>
  <strong>
    Orders
  </strong>

  <h2>
    My Orders
  </h2>

  <p>
    View your Smart Memories
    purchases and order history.
  </p>
</Link>
        <Link
          className="card dashlink"
          href="/shop"
        >
          <strong>
            Shop
          </strong>

          <h2>
            Create Another Gift
          </h2>

          <p>
            Personalise another
            Smart Memories gift.
          </p>
        </Link>

        <Link
          className="card dashlink"
          href="/account/logout"
        >
          <strong>
            Account
          </strong>

          <h2>
            Sign Out
          </h2>

          <p>
            Securely sign out of
            your customer account.
          </p>
        </Link>
      </div>
    </section>
  );
}