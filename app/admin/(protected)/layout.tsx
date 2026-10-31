import Link from 'next/link';

import {
  redirect,
} from 'next/navigation';

import {
  createSupabaseServerClient,
} from '../../../lib/supabaseServer';

export default async function AdminProtectedLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
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
      '/admin/login'
    );
  }

  const allowedEmails =
    (
      process.env
        .ADMIN_EMAILS || ''
    )
      .split(',')
      .map(
        (email) =>
          email
            .trim()
            .toLowerCase()
      )
      .filter(Boolean);

  const userEmail =
    user.email
      ?.toLowerCase() ||
    '';

  if (
    !allowedEmails.includes(
      userEmail
    )
  ) {
    await supabase.auth
      .signOut();

    redirect(
      '/admin/login'
    );
  }

  return (
    <>
      <section className="wrap">
        <div
          className="card"
          style={{
            marginBottom:
              '24px',
          }}
        >
          <span className="eyebrow">
            OWNER AREA
          </span>

          <nav
            style={{
              display: 'flex',
              gap: '18px',
              flexWrap: 'wrap',
              marginTop:
                '12px',
            }}
          >
            <Link href="/admin">
              Dashboard
            </Link>

            <Link href="/admin/orders">
              Orders
            </Link>

            <Link href="/admin/memories">
              Memories
            </Link>

            <Link href="/admin/corporate">
              Corporate
            </Link>

            <Link href="/admin/completed">
              Completed
            </Link>

            <Link href="/admin/logout">
              Logout
            </Link>
          </nav>
        </div>
      </section>

      {children}
    </>
  );
}
