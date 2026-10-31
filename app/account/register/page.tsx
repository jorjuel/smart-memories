import Link from 'next/link';

import {
  customerRegister,
} from './actions';

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function CustomerRegisterPage({
  searchParams,
}: Props) {
  const params =
    await searchParams;

  let errorMessage = '';

  if (
    params.error ===
    'missing'
  ) {
    errorMessage =
      'Please complete all fields.';
  } else if (
    params.error ===
    'match'
  ) {
    errorMessage =
      'The passwords do not match.';
  } else if (
    params.error ===
    'short'
  ) {
    errorMessage =
      'Password must be at least 8 characters.';
  } else if (
    params.error ===
    'owner'
  ) {
    errorMessage =
      'This email is reserved for owner access.';
  } else if (
    params.error
  ) {
    errorMessage =
      params.error;
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
          Create Your Account
        </h1>

        <p className="lead">
          Keep your memories linked
          to you across devices.
        </p>

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

        <form
          action={
            customerRegister
          }
        >
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
              minLength={8}
              required
            />

            <label>
              Confirm Password
            </label>

            <input
              name="confirmPassword"
              type="password"
              minLength={8}
              required
            />

            <button
              type="submit"
              className="btn big"
            >
              Create Account
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
            Already registered?{' '}
            <Link href="/account/login">
              Sign in
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