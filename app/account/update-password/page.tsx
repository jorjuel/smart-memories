import Link from 'next/link';

import {
  updatePassword,
} from './actions';

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function UpdatePasswordPage({
  searchParams,
}: Props) {
  const params =
    await searchParams;

  let errorMessage = '';

  if (
    params.error === 'missing'
  ) {
    errorMessage =
      'Enter your new password twice.';
  }

  if (
    params.error === 'length'
  ) {
    errorMessage =
      'Your password must be at least 8 characters.';
  }

  if (
    params.error === 'mismatch'
  ) {
    errorMessage =
      'The passwords do not match.';
  }

  if (
    params.error === 'session'
  ) {
    errorMessage =
      'This reset link is invalid or has expired. Request a new one.';
  }

  if (
    params.error === 'update'
  ) {
    errorMessage =
      'The password could not be changed. Request a new reset link.';
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
          SMART MEMORIES
        </span>

        <h1>
          Choose a New Password
        </h1>

        <p className="lead">
          Set the password you will
          use for your Smart Memories
          admin account.
        </p>

        {errorMessage && (
          <div
            style={{
              padding: '14px',
              margin: '18px 0',
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
            updatePassword
          }
        >
          <div
            style={{
              display: 'grid',
              gap: '14px',
            }}
          >
            <label>
              New password
            </label>

            <input
              name="password"
              type="password"
              minLength={8}
              required
            />

            <label>
              Confirm new password
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
              Set New Password
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