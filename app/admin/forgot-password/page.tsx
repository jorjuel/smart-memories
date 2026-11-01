import Link from 'next/link';

import {
  requestAdminPasswordReset,
} from './actions';

type Props = {
  searchParams: Promise<{
    error?: string;
    sent?: string;
  }>;
};

export default async function AdminForgotPasswordPage({
  searchParams,
}: Props) {
  const params =
    await searchParams;

  return (
    <section className="wrap">
      <div
        className="card"
        style={{
          maxWidth: '520px',
          margin: '70px auto',
        }}
      >
        <span className="eyebrow">
          OWNER ACCESS
        </span>

        <h1>
          Reset Admin Password
        </h1>

        <p className="lead">
          Enter the email address
          authorised for Smart Memories
          admin access.
        </p>

        {params.sent === '1' && (
          <div
            style={{
              padding: '14px',
              margin: '18px 0',
              border:
                '1px solid #b8d9bf',
              borderRadius: '12px',
              background: '#f2faf3',
            }}
          >
            If that email is authorised,
            a password reset link has
            been sent. Check your inbox.
          </div>
        )}

        {params.error ===
          'missing' && (
          <div
            style={{
              padding: '14px',
              margin: '18px 0',
              border:
                '1px solid #d9a3a3',
              borderRadius: '12px',
            }}
          >
            Enter your email address.
          </div>
        )}

        <form
          action={
            requestAdminPasswordReset
          }
        >
          <div
            style={{
              display: 'grid',
              gap: '14px',
            }}
          >
            <label>
              Admin email
            </label>

            <input
              type="email"
              name="email"
              required
            />

            <button
              type="submit"
              className="btn big"
            >
              Send Reset Link
            </button>
          </div>
        </form>

        <p
          style={{
            marginTop: '20px',
          }}
        >
          <Link href="/admin/login">
            Back to Admin Login
          </Link>
        </p>
      </div>
    </section>
  );
}