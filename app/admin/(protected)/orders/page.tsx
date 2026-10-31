import Link from 'next/link';

import {
  supabaseAdmin,
} from '../../../../lib/supabaseAdmin';

import {
  updateMemoryStatus,
} from '../actions';

export const dynamic =
  'force-dynamic';

type MemoryJob = {
  id: string;
  code: string;
  recipient_name: string;
  sender_name: string | null;
  message: string | null;
  photo_url: string | null;
  audio_url: string | null;
  status:
    | 'new'
    | 'in_production'
    | 'completed';
  created_at: string;
};

function formatDate(
  value: string
) {
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

function statusLabel(
  status: string
) {
  if (
    status ===
    'in_production'
  ) {
    return 'In Production';
  }

  if (
    status ===
    'completed'
  ) {
    return 'Completed';
  }

  return 'New';
}

export default async function AdminOrdersPage() {
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
        message,
        photo_url,
        audio_url,
        status,
        created_at
      `
    )
    .neq(
      'status',
      'completed'
    )
    .order(
      'created_at',
      {
        ascending: false,
      }
    );

  if (error) {
    return (
      <section className="wrap">
        <h1>
          Active Orders
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
    (data || []) as MemoryJob[];

  return (
    <section className="wrap">
      <span className="eyebrow">
        PRODUCTION
      </span>

      <h1>
        Active Orders
      </h1>

      <p className="lead">
        New and in-production
        Smart Memory jobs.
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
          Active jobs:
          {' '}
          {jobs.length}
        </strong>
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <h2>
            No active jobs
          </h2>

          <p>
            New customer jobs
            will appear here.
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
                        ? '160px 1fr'
                        : '1fr',
                    gap:
                      '24px',
                    alignItems:
                      'start',
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
                      {statusLabel(
                        job.status
                      )}
                    </span>

                    <h2>
                      {job.recipient_name}
                    </h2>

                    <p>
                      <strong>
                        Memory code:
                      </strong>
                      {' '}
                      {job.code}
                    </p>

                    <p>
                      <strong>
                        From:
                      </strong>
                      {' '}
                      {job.sender_name ||
                        'Not provided'}
                    </p>

                    <p>
                      <strong>
                        Created:
                      </strong>
                      {' '}
                      {formatDate(
                        job.created_at
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

                      {job.status ===
                        'new' && (
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
                            Start Production
                          </button>
                        </form>
                      )}

                      {job.status ===
                        'in_production' && (
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
                            value="completed"
                          />

                          <button
                            type="submit"
                            className="btn"
                          >
                            Mark as Done
                          </button>
                        </form>
                      )}
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