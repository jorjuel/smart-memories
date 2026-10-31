import Link from 'next/link';

import {
  customerLogin,
} from './actions';

type Props = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function CustomerLoginPage({
  searchParams,
}: Props) {
  const params =
    await searchParams;

  let errorMessage = '';

  if (
    params.error ===
    'invalid'
  ) {
    errorMessage =
      'Email or password is incorrect.';
  }

  if (
    params.error ===
    'missing'
  ) {
    errorMessage =
      'Please enter your email and password.';
  }

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
          CUSTOMER ACCOUNT
        </span>

        <h1>
          Sign In
        </h1>

        <p className="lead">
          Access your Smart Memories
          and customer account.
        </p>

        {params.message ===
          'check-email' && (
          <div
            style={{
              padding: '14px',
              marginBottom: '18px',
              borderRadius: '12px',
              background: '#fffaf7',
            }}
          >
            Please check your email
            to confirm your account.
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              padding: '14px',
              marginBottom: '18px',
              border:
                '1px solid #d9a3a3',
              borderRadius: '12px',
            }}
          >
            {errorMessage}
          </div>
        )}

        <form action={customerLogin}>
          <div
            style={{
              display: 'grid',
              gap: '14px',
            }}
          >
            <label>
              Email
            </label>

            <input
              name="email"
              type="email"
              required
            />

            <label>
              Password
            </label>

            <input
              name="password"
              type="password"
              required
            />

            <button
              type="submit"
              className="btn big"
            >
              Sign In
            </button>
          </div>
        </form>

        <div
          style={{
            marginTop: '24px',
            display: 'grid',
            gap: '12px',
          }}
        >
          <p>
            New customer?{' '}
            <Link href="/account/register">
              Create an account
            </Link>
          </p>

          <Link
            href="/shop"
            className="btn secondary"
          >
            Continue as Guest
          </Link>
        </div>
      </div>
    </section>
  );
}