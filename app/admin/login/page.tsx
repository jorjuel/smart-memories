import {
  adminLogin,
} from './actions';

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({
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
    'unauthorised'
  ) {
    errorMessage =
      'This account is not authorised for owner access.';
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
          OWNER ACCESS
        </span>

        <h1>
          Smart Memories Admin
        </h1>

        <p className="lead">
          Sign in to manage
          Smart Memories production.
        </p>

        {errorMessage && (
          <div
            style={{
              margin:
                '16px 0',
              padding:
                '12px 16px',
              border:
                '1px solid #d9a3a3',
              borderRadius:
                '12px',
            }}
          >
            {errorMessage}
          </div>
        )}

        <form
          action={
            adminLogin
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
              required
            />

            <button
              type="submit"
              className="btn big"
              style={{
                marginTop:
                  '10px',
              }}
            >
              Owner Login
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}