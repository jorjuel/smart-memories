import Link from 'next/link';

import {
  supabaseAdmin,
} from '../../../../lib/supabaseAdmin';

import {
  updateMemoryStatus,
} from '../actions';

export const dynamic =
  'force-dynamic';

type CompletedJob = {
  id: string;
  code: string;
  recipient_name: string;
  sender_name: string | null;
  photo_url: string | null;
  created_at: string;
  completed_at: string | null;
};

function formatDate(
  value: string | null
) {
  if (!value) {
    return 'Not recorded';
  }

  return new Intl.DateTimeFormat(
    'en-GB',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  ).format(
    new Date(value)
  );
}

export default async function CompletedPage() {
  const supabase =
    supabaseAdmin();

  const {
    data,
    error,
  } = await supabase
    .from('memories')
    .select(
      `
        id,
        code,
        recipient_name,
        sender_name,
        photo_url,
        created_at,
        completed_at
      `
    )
    .eq(
      'status',
      'completed'
    )
    .order(
      'completed_at',
      {
        ascending: false,
      }
    );

  if (error) {
    return (
      <section className="wrap">
        <h1>
          Completed
        </h1>

        <div className="card">
          <p>
            {error.message}
          </p>
        </div>
      </section>
    );
  }

  const jobs =
    (data || []) as CompletedJob[];

  return (
    <section className="wrap">
      <span className="eyebrow">
        ARCHIVE
      </span>

      <h1>
        Completed Orders
      </h1>

      <p className="lead">
        Finished production jobs.
        Their Smart Memory pages
        remain active.
      </p>

      <div
        style={{
          margin:
            '24px 0',
          padding:
            '16px 20px',
          border:
            '1px solid #ead8cf',
          borderRadius:
            '16px',
          background:
            '#fffaf7',
        }}
      >
        <strong>
          Completed jobs:
          {' '}
          {jobs.length}
        </strong>
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <h2>
            Nothing completed yet
          </h2>

          <p>
            Jobs marked as done
            will automatically move
            here.
          </p>
        </div>
      ) : (
        <div
          style={{
            display:
              'grid',
            gap: '20px',
          }}
        >
          {jobs.map(
            (job) => (
              <article
                key={job.id}
                className="card"
              >
                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      job.photo_url
                        ? '130px 1fr'
                        : '1fr',
                    gap:
                      '22px',
                  }}
                >
                  {job.photo_url && (
                    <img
                      src={
                        job.photo_url
                      }
                      alt=""
                      style={{
                        width:
                          '100%',
                        aspectRatio:
                          '1 / 1',
                        objectFit:
                          'cover',
                        borderRadius:
                          '14px',
                      }}
                    />
                  )}

                  <div>
                    <span className="eyebrow">
                      COMPLETED
                    </span>

                    <h2>
                      {job.recipient_name}
                    </h2>

                    <p>
                      <strong>
                        Code:
                      </strong>
                      {' '}
                      {job.code}
                    </p>

                    <p>
                      <strong>
                        Completed:
                      </strong>
                      {' '}
                      {formatDate(
                        job.completed_at
                      )}
                    </p>

                    <div
                      style={{
                        display:
                          'flex',
                        gap:
                          '12px',
                        flexWrap:
                          'wrap',
                        marginTop:
                          '18px',
                      }}
                    >
                      <Link
                        href={`/m/${job.code}`}
                        target="_blank"
                        className="btn secondary"
                      >
                        View Memory
                      </Link>

                      <form
                        action={
                          updateMemoryStatus
                        }
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={
                            job.id
                          }
                        />

                        <input
                          type="hidden"
                          name="status"
                          value="in_production"
                        />

                        <button
                          type="submit"
                          className="btn"
                        >
                          Restore Job
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </section>
  );
}