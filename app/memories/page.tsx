'use client';

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

type CloudMemory = {
  code: string;
  recipient: string;
  message: string | null;
  sender: string | null;
  createdAt: string;
  photoUrl: string | null;
  audioUrl: string | null;
  videoUrl: string | null;
};

type CartItem = {
  memoryCode?: string | null;
};

const CART_KEY =
  'smart-memories-cart';

const MEMORY_LIBRARY_KEY =
  'smart-memories-owned-codes';

function validCode(
  value: unknown
): value is string {
  return (
    typeof value === 'string' &&
    /^[A-Z2-9]{8}$/.test(
      value.toUpperCase()
    )
  );
}

export default function MyMemoriesPage() {
  const [
    items,
    setItems,
  ] = useState<CloudMemory[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  useEffect(() => {
    async function loadMyMemories() {
      try {
        /*
         * 1. Read memories already associated
         *    with this browser.
         */
        let savedCodes:
          string[] = [];

        try {
          const raw =
            localStorage.getItem(
              MEMORY_LIBRARY_KEY
            );

          const parsed =
            raw
              ? JSON.parse(raw)
              : [];

          if (
            Array.isArray(
              parsed
            )
          ) {
            savedCodes =
              parsed.filter(
                validCode
              );
          }
        } catch {
          savedCodes = [];
        }

        /*
         * 2. Read memory codes from this
         *    customer's own basket.
         */
        let basketCodes:
          string[] = [];

        try {
          const rawCart =
            localStorage.getItem(
              CART_KEY
            );

          const parsedCart =
            rawCart
              ? JSON.parse(
                  rawCart
                )
              : [];

          if (
            Array.isArray(
              parsedCart
            )
          ) {
            basketCodes =
              (
                parsedCart as CartItem[]
              )
                .map(
                  (item) =>
                    item.memoryCode
                )
                .filter(
                  validCode
                );
          }
        } catch {
          basketCodes = [];
        }

        /*
         * 3. Merge them.
         *
         * This means memories currently
         * in the customer's basket are
         * automatically added to their
         * private browser library.
         */
        const codes =
          Array.from(
            new Set([
              ...savedCodes,
              ...basketCodes,
            ])
          );

        localStorage.setItem(
          MEMORY_LIBRARY_KEY,
          JSON.stringify(
            codes
          )
        );

        /*
         * 4. Load ONLY those individual
         *    memories.
         *
         * We never call /api/memories,
         * because that route represents
         * the complete database.
         */
        const results =
          await Promise.all(
            codes.map(
              async (
                code
              ) => {
                const response =
                  await fetch(
                    `/api/memories/${encodeURIComponent(
                      code
                    )}`,
                    {
                      cache:
                        'no-store',
                    }
                  );

                if (
                  !response.ok
                ) {
                  return null;
                }

                const memory =
                  await response.json();

                return {
                  code:
                    memory.code,

                  recipient:
                    memory.recipient,

                  message:
                    memory.message,

                  sender:
                    memory.sender,

                  createdAt:
                    memory.created_at,

                  photoUrl:
                    memory.photoUrl,

                  audioUrl:
                    memory.audioUrl,

                  videoUrl:
                    memory.videoUrl,
                } as CloudMemory;
              }
            )
          );

        const validMemories =
          results.filter(
            (
              memory
            ): memory is CloudMemory =>
              memory !== null
          );

        setItems(
          validMemories
        );
      } catch (
        loadError
      ) {
        console.error(
          'MY MEMORIES ERROR:',
          loadError
        );

        setError(
          'Could not load your memories.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadMyMemories();
  }, []);

  return (
    <section className="wrap">
      <div className="titleRow">
        <div>
          <span className="eyebrow">
            MY SMART MEMORIES
          </span>

          <h1>
            My Memories
          </h1>

          <p className="lead">
            Memories saved from this
            browser appear here.
          </p>
        </div>

        <Link
          className="btn"
          href="/shop"
        >
          Create a Gift
        </Link>
      </div>

      {loading && (
        <div className="card">
          <p>
            Loading your
            memories...
          </p>
        </div>
      )}

      {error && (
        <div className="card">
          <p>
            {error}
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        items.length ===
          0 && (
          <div className="card">
            <h2>
              No memories saved
              on this browser yet
            </h2>

            <p>
              When you create a
              personalised Smart
              Memories gift, it will
              appear here.
            </p>

            <Link
              href="/shop"
              className="btn"
            >
              Browse Gifts
            </Link>
          </div>
        )}

      {!loading &&
        !error &&
        items.length >
          0 && (
          <div
            style={{
              display:
                'grid',
              gap: '20px',
            }}
          >
            {items.map(
              (
                memory
              ) => (
                <article
                  className="card"
                  key={
                    memory.code
                  }
                >
                  <div
                    style={{
                      display:
                        'grid',
                      gridTemplateColumns:
                        memory.photoUrl
                          ? '150px 1fr'
                          : '1fr',
                      gap:
                        '22px',
                      alignItems:
                        'start',
                    }}
                  >
                    {memory.photoUrl && (
                      <img
                        src={
                          memory.photoUrl
                        }
                        alt={
                          memory.recipient
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
                    )}

                    <div>
                      <span className="eyebrow">
                        SMART MEMORY
                      </span>

                      <h2>
                        {
                          memory.recipient
                        }
                      </h2>

                      <p>
                        <strong>
                          Memory
                          code:
                        </strong>
                        {' '}
                        {
                          memory.code
                        }
                      </p>

                      {memory.sender && (
                        <p>
                          <strong>
                            From:
                          </strong>
                          {' '}
                          {
                            memory.sender
                          }
                        </p>
                      )}

                      {memory.message && (
                        <p>
                          {
                            memory.message
                          }
                        </p>
                      )}

                      {memory.audioUrl && (
                        <div
                          style={{
                            margin:
                              '16px 0',
                          }}
                        >
                          <audio
                            controls
                            preload="none"
                            src={
                              memory.audioUrl
                            }
                            style={{
                              width:
                                '100%',
                              maxWidth:
                                '440px',
                            }}
                          />
                        </div>
                      )}

                      <Link
                        href={`/m/${memory.code}`}
                        className="btn"
                      >
                        Open Memory
                      </Link>
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