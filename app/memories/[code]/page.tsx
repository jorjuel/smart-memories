import Link from 'next/link';

import {
  notFound,
  redirect,
} from 'next/navigation';

import {
  createSupabaseServerClient,
} from '../../../lib/supabaseServer';

import {
  getCustomerMemoryByCode,
} from '../../../lib/customerMemories';

import AccountNav from '../../../components/AccountNav';
import CopyMemoryLink from '../../../components/CopyMemoryLink';

export const dynamic =
  'force-dynamic';

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    'en-GB',
    {
      dateStyle:
        'long',
    }
  ).format(
    new Date(value)
  );
}

export default async function MemoryOwnerPage({
  params,
}: {
  params: Promise<{
    code: string;
  }>;
}) {
  const auth =
    await createSupabaseServerClient();

  const {
    data: {
      user,
    },
  } =
    await auth.auth
      .getUser();

  if (!user) {
    redirect(
      '/account/login'
    );
  }

  const {
    code,
  } =
    await params;

  let memory = null;

  try {
    memory =
      await getCustomerMemoryByCode(
        user.id,
        code
      );
  } catch (
    error
  ) {
    console.error(
      'OWNER MEMORY ERROR:',
      error
    );
  }

  if (!memory) {
    notFound();
  }

  const gift =
    memory
      .connectedGifts[0];

  return (
    <main className="smAccountPage">
      <AccountNav />

      <section className="smOwnerMemoryHeader">
        <div>
          <Link
            href="/memories"
            className="smOwnerBack"
          >
            ← Back to My Memories
          </Link>

          <span className="v14Eyebrow">
            YOUR SMART MEMORY
          </span>

          <h1>
            {memory.recipient
              ? `Memory for ${memory.recipient}`
              : 'Your Smart Memory'}
          </h1>

          <p>
            Created{' '}
            {formatDate(
              memory.createdAt
            )}
          </p>
        </div>

        <div className="smOwnerHeaderActions">
          <Link
            href={`/m/${memory.code}`}
            className="btn big"
          >
            View Recipient
            Experience
          </Link>

          <CopyMemoryLink
            code={
              memory.code
            }
          />
        </div>
      </section>

      <section className="smOwnerMemoryGrid">
        <div className="smOwnerMemoryMain">
          <article className="smOwnerSection">
            <span className="eyebrow">
              PHOTO
            </span>

            <h2>
              Your Memory
            </h2>

            {memory.photoUrl ? (
              <img
                className="smOwnerMemoryPhoto"
                src={
                  memory.photoUrl
                }
                alt={
                  memory.recipient
                    ? `Memory for ${memory.recipient}`
                    : 'Smart Memory photograph'
                }
              />
            ) : (
              <div className="smOwnerNoMedia">
                No photograph was
                added to this
                memory.
              </div>
            )}
          </article>

          <article className="smOwnerSection">
            <span className="eyebrow">
              MESSAGE
            </span>

            <h2>
              Your Words
            </h2>

            <p className="smOwnerMessage">
              {memory.message ||
                'No personal message was added.'}
            </p>

            {memory.sender && (
              <p className="smOwnerSender">
                From{' '}
                <strong>
                  {
                    memory.sender
                  }
                </strong>
              </p>
            )}
          </article>

          <article className="smOwnerSection">
            <span className="eyebrow">
              VOICE
            </span>

            <h2>
              Voice Message
            </h2>

            {memory.audioUrl ? (
              <audio
                controls
                preload="metadata"
                src={
                  memory.audioUrl
                }
              />
            ) : (
              <p>
                No voice message
                was added.
              </p>
            )}
          </article>

          {memory.videoUrl && (
            <article className="smOwnerSection">
              <span className="eyebrow">
                VIDEO
              </span>

              <h2>
                Video
              </h2>

              <video
                controls
                preload="metadata"
                src={
                  memory.videoUrl
                }
              />
            </article>
          )}
        </div>

        <aside className="smOwnerMemorySidebar">
          <article className="smOwnerSideCard">
            <span className="eyebrow">
              SMART GIFT
            </span>

            <h2>
              Connected Gift
            </h2>

            {gift ? (
              <>
                <strong>
                  {
                    gift.productName
                  }
                </strong>

                {gift.occasion && (
                  <p>
                    {
                      gift.occasion
                    }
                  </p>
                )}

                {gift.productSlug && (
                  <Link
                    href={`/shop/${gift.productSlug}`}
                    className="btn secondary"
                  >
                    View Product
                  </Link>
                )}
              </>
            ) : (
              <p>
                This memory is not
                currently linked to
                a purchased Smart
                Gift.
              </p>
            )}
          </article>

          <article className="smOwnerSideCard">
            <span className="eyebrow">
              ACCESS
            </span>

            <h2>
              Smart Memory Access
            </h2>

            <p>
              Only you can access
              this owner page
              through your
              account.
            </p>

            <p>
              Anyone you choose to
              give the unique
              recipient link to
              can open the
              recipient
              experience.
            </p>

            <CopyMemoryLink
              code={
                memory.code
              }
            />
          </article>

          <article className="smOwnerSideCard muted">
            <strong>
              Editing after
              creation
            </strong>

            <p>
              Customer editing is
              not currently
              available. Your
              existing recipient
              experience remains
              unchanged.
            </p>
          </article>
        </aside>
      </section>
    </main>
  );
}