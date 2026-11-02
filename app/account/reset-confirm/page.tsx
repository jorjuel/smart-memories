import Link from 'next/link';

import {
  confirmPasswordRecovery,
} from './actions';

type Props = {
  searchParams: Promise<{
    token_hash?: string;
  }>;
};

export default async function ResetConfirmPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const tokenHash =
    params.token_hash?.trim() || '';

  if (!tokenHash) {
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

          <h1>Reset Link Invalid</h1>

          <p className="lead">
            This password reset link is
            missing or invalid.
          </p>

          <Link
            href="/account/forgot-password"
            className="btn big"
          >
            Request a New Reset Link
          </Link>
        </div>
      </section>
    );
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

        <h1>Continue Password Reset</h1>

        <p className="lead">
          Click below to continue and choose
          a new password for your Smart
          Memories account.
        </p>

        <form action={confirmPasswordRecovery}>
          <input
            type="hidden"
            name="token_hash"
            value={tokenHash}
          />

          <button
            type="submit"
            className="btn big"
          >
            Continue to Reset Password
          </button>
        </form>

        <p style={{ marginTop: '20px' }}>
          <Link href="/account/login">
            Back to Sign In
          </Link>
        </p>
      </div>
    </section>
  );
}