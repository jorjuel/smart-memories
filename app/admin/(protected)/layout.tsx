import Link from 'next/link';

import {
  RedirectType,
  redirect,
} from 'next/navigation';

import {
  createSupabaseAdminAuthClient,
} from '../../../lib/supabaseAdminAuthServer';

async function logout() {
  'use server';

  const supabase = await createSupabaseAdminAuthClient();
  await supabase.auth.signOut();
  redirect('/tags', RedirectType.replace);
}

export default async function AdminProtectedLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
 const supabase =
  await createSupabaseAdminAuthClient();

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
            <Link href="/" style={{ fontWeight: 700 }}>
              View Full Website
            </Link>

            <Link href="/admin">
              Dashboard
            </Link>

            <Link href="/admin/fair-setup">Fair Setup</Link>
            <Link href="/admin/fair-visits">Fair Visits</Link>
            <Link href="/admin/promotion-pdfs">Promotion PDFs</Link>

            <Link href="/admin/orders">
              Orders
            </Link>

            <Link href="/admin/products">
              Product Photos
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

            <form action={logout}>
              <button type="submit">Logout</button>
            </form>
          </nav>
        </div>
      </section>

      {children}
    </>
  );
}
