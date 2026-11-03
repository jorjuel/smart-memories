import Link from 'next/link';

import {
  requestCustomerPasswordReset,
} from './actions';

type Props = {
  searchParams: Promise<{
    error?: string;
    sent?: string;
  }>;
};

export default async function CustomerForgotPasswordPage({
  searchParams,
}: Props) {
  const params =
    await searchParams;

  let errorMessage = '';

  if (params.error === 'missing') {
    errorMessage =
      'Please enter your email address.';
  }

  if (params.error === 'send') {
    errorMessage =
      'We could not send the reset email. Please try again.';
  }

  if (params.error === 'invalid') {
    errorMessage =
      'Your reset link is invalid or expired. Please request a new one.';
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
          Reset Your Password
        </h1>

        <p className="lead">
          Enter the email address
          linked to your Smart Memories
          account.
        </p>

        {params.sent === '1' && (
          <div
            style={{
              padding: '14px',
              marginBottom: '18px',
              borderRadius: '12px',
              background: '#fffaf7',
            }}
          >
            Check your email for a
            password reset link.
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

        <form
          action={
            requestCustomerPasswordReset
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
          <Link href="/account/login">
            Back to Sign In
          </Link>
        </p>
      </div>
    </section>
  );
}