import Link from 'next/link';

import {
  redirect,
} from 'next/navigation';

import {
  createSupabaseServerClient,
} from '../../lib/supabaseServer';

import {
  getCustomerMemories,
  type CustomerMemory,
} from '../../lib/customerMemories';

import AccountNav from '../../components/AccountNav';
import MemoryLibrary from '../../components/MemoryLibrary';

export const dynamic =
  'force-dynamic';

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MyMemoriesPage() {
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
      '/account/login?next=/memories'
    );
  }

 let memories: CustomerMemory[] = [];
  let loadFailed =
    false;

  try {
    memories =
      await getCustomerMemories(
        user.id
      );
  } catch (
    error
  ) {
    console.error(
      'MY MEMORIES ERROR:',
      error
    );

    loadFailed =
      true;
  }

  const photoCount =
    memories.filter(
      (memory) =>
        Boolean(
          memory.photoUrl
        )
    ).length;

  const voiceCount =
    memories.filter(
      (memory) =>
        Boolean(
          memory.audioUrl
        )
    ).length;

  return (
    <main className="smAccountPage">
      <AccountNav />

      <section className="smMemoryLibraryHero">
        <div>
          <span className="v14Eyebrow">
            YOUR SMART MEMORIES
          </span>

          <h1>
            My Memories
          </h1>

          <p>
            All the moments
            you've created and
            preserved — in one
            place.
          </p>
        </div>

        <Link
          href="/create"
          className="btn big"
        >
          Create a New Memory
        </Link>
      </section>

      {!loadFailed &&
        memories.length >
          0 && (
          <section className="smMemoryStats">
            <article>
              <strong>
                {
                  memories.length
                }
              </strong>

              <span>
                {memories.length ===
                1
                  ? 'Memory'
                  : 'Memories'}
              </span>
            </article>

            <article>
              <strong>
                {
                  photoCount
                }
              </strong>

              <span>
                Photos
              </span>
            </article>

            <article>
              <strong>
                {
                  voiceCount
                }
              </strong>

              <span>
                Voice Messages
              </span>
            </article>
          </section>
        )}

      <section className="smMemoryPrivacy">
        <span>
          🔒
        </span>

        <div>
          <strong>
            Your memories are
            personal.
          </strong>

          <p>
            Only you can access
            the owner library
            through your account.
            Recipient access uses
            the unique Smart
            Memory link connected
            to the gift.
          </p>
        </div>
      </section>

      {loadFailed ? (
        <section className="smMemoryLoadError">
          <h2>
            We couldn't load
            your memories.
          </h2>

          <p>
            Please try again.
          </p>

          <Link
            href="/memories"
            className="btn"
          >
            Try Again
          </Link>
        </section>
      ) : (
        <MemoryLibrary
          memories={
            memories
          }
        />
      )}
    </main>
  );
}