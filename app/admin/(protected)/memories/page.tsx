import Link from 'next/link';

import {
  supabaseAdmin,
} from '../../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

type MemoryRecord = {
  id: string;
  code: string;
  recipient_name: string;
  message: string | null;
  sender_name: string | null;
  photo_url: string | null;
  audio_url: string | null;
  video_url: string | null;
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

export default async function AdminMemoriesPage() {
  const supabase =
    supabaseAdmin();

  const {
    data,
    error,
  } =
    await supabase
      .from('memories')
      .select(
        `
          id,
          code,
          recipient_name,
          message,
          sender_name,
          photo_url,
          audio_url,
          video_url,
          created_at
        `
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
        <span className="eyebrow">
          SMART MEMORIES
        </span>

        <h1>
          Memories
        </h1>

        <div className="card">
          <h2>
            Unable to load memories
          </h2>

          <p>
            {error.message}
          </p>
        </div>
      </section>
    );
  }

  const memories =
    (data || []) as MemoryRecord[];

  return (
    <section className="wrap">
      <span className="eyebrow">
        SMART MEMORIES
      </span>

      <h1>
        Memories
      </h1>

      <p className="lead">
        Customer photos,
        recordings and Smart Memory
        codes stored in Supabase.
      </p>

      <div
        style={{
          margin:
            '24px 0',
          padding:
            '18px 20px',
          border:
            '1px solid #ead8cf',
          borderRadius:
            '16px',
          background:
            '#fffaf7',
        }}
      >
        <strong>
          Total memories:
          {' '}
          {memories.length}
        </strong>
      </div>

      {memories.length ===
      0 ? (
        <div className="card">
          <h2>
            No memories yet
          </h2>

          <p>
            New Smart Memories
            created by customers
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
          {memories.map(
            (memory) => (
              <article
                key={
                  memory.id
                }
                className="card"
              >
                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      memory.photo_url
                        ? '180px 1fr'
                        : '1fr',
                    gap:
                      '24px',
                    alignItems:
                      'start',
                  }}
                >
                  {memory.photo_url && (
                    <div>
                      <img
                        src={
                          memory.photo_url
                        }
                        alt={
                          memory.recipient_name
                            ? `Memory for ${memory.recipient_name}`
                            : 'Smart Memory'
                        }
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
                    </div>
                  )}

                  <div>
                    <span className="eyebrow">
                      CODE:
                      {' '}
                      {memory.code}
                    </span>

                    <h2>
                      {memory.recipient_name ||
                        'Smart Memory'}
                    </h2>

                    <p>
                      <strong>
                        From:
                      </strong>
                      {' '}
                      {memory.sender_name ||
                        'Not provided'}
                    </p>

                    {memory.message && (
                      <p>
                        <strong>
                          Message:
                        </strong>
                        {' '}
                        {memory.message}
                      </p>
                    )}

                    <p>
                      <strong>
                        Created:
                      </strong>
                      {' '}
                      {formatDate(
                        memory.created_at
                      )}
                    </p>

                    {memory.audio_url && (
                      <div
                        style={{
                          margin:
                            '16px 0',
                        }}
                      >
                        <strong>
                          Voice Memory
                        </strong>

                        <div
                          style={{
                            marginTop:
                              '8px',
                          }}
                        >
                          <audio
                            controls
                            preload="none"
                            src={
                              memory.audio_url
                            }
                            style={{
                              width:
                                '100%',
                              maxWidth:
                                '440px',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {memory.video_url && (
                      <p>
                        <a
                          href={
                            memory.video_url
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open video
                        </a>
                      </p>
                    )}

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
                        href={`/m/${memory.code}`}
                        className="btn"
                        target="_blank"
                      >
                        Open Memory Page
                      </Link>

                      {memory.photo_url && (
                        <a
                          href={
                            memory.photo_url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="btn secondary"
                        >
                          Open Photo
                        </a>
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