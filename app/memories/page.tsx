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

type SessionResponse = {
  loggedIn: boolean;
};

const CART_KEY =
  'smart-memories-cart';

const GUEST_MEMORY_KEY =
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

  const [
    loggedIn,
    setLoggedIn,
  ] = useState(false);

  useEffect(() => {
    async function loadMemories() {
      try {
        /*
         * First check whether the
         * customer is logged in.
         */
        const sessionResponse =
          await fetch(
            '/api/account/session',
            {
              cache:
                'no-store',
            }
          );

        let hasAccount =
          false;

        if (
          sessionResponse.ok
        ) {
          const sessionData =
            (await sessionResponse.json()) as SessionResponse;

          hasAccount =
            sessionData.loggedIn;

          setLoggedIn(
            hasAccount
          );
        }

        /*
         * Logged-in customers:
         * ask for only their own
         * account memories.
         */
        if (
          hasAccount
        ) {
          const response =
            await fetch(
              '/api/account/memories',
              {
                cache:
                  'no-store',
              }
            );

          if (
            !response.ok
          ) {
            throw new Error(
              'Could not load account memories'
            );
          }

          const data =
            await response.json();

          setItems(
            data
          );

          return;
        }

        /*
         * Guest customers:
         * only use memory codes
         * already saved on this
         * browser.
         */
        let savedCodes:
          string[] = [];

        try {
          const raw =
            localStorage.getItem(
              GUEST_MEMORY_KEY
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
         * Also collect memory codes
         * from this browser's basket.
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

        const codes =
          Array.from(
            new Set([
              ...savedCodes,
              ...basketCodes,
            ])
          );

        localStorage.setItem(
          GUEST_MEMORY_KEY,
          JSON.stringify(
            codes
          )
        );

        /*
         * Load each guest memory
         * individually by code.
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

        setItems(
          results.filter(
            (
              item
            ): item is CloudMemory =>
              item !== null
          )
        );
      } catch (
        loadError
      ) {
        console.error(
          loadError
        );

        setError(
          'Could not load your memories.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadMemories();
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
            {loggedIn
              ? 'Memories linked to your account.'
              : 'Memories saved on this browser.'}
          </p>
        </div>

        <Link
          className="btn"
          href="/shop"
        >
          Create a Gift
        </Link>
      </div>

      {!loggedIn && (
        <div
          className="card"
          style={{
            marginBottom:
              '20px',
          }}
        >
          <h2>
            Want your memories on every device?
          </h2>

          <p>
            You can continue as a guest,
            or create a free account to
            keep your memories linked to
            you across devices.
          </p>

          <div
            style={{
              display:
                'flex',
              gap: '12px',
              flexWrap:
                'wrap',
              marginTop:
                '14px',
            }}
          >
            <Link
              href="/account/register"
              className="btn"
            >
              Create Account
            </Link>

            <Link
              href="/account/login"
              className="btn secondary"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {loading && (
        <div className="card">
          <p>
            Loading your memories...
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
              No memories yet
            </h2>

            <p>
              When you create a
              Smart Memories gift,
              it will appear here.
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
                  key={
                    memory.code
                  }
                  className="card"
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
                          Code:
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
                            marginBottom:
                              '16px',
                          }}
                        />
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