'use client';

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import RecipientMemoryExperience from '@/components/recipient/RecipientMemoryExperience';

import type {
  PublicMemory,
} from '@/components/recipient/types';

export default function MemoryPage({
  params,
}: {
  params: Promise<{
    code: string;
  }>;
}) {
  const [
    memory,
    setMemory,
  ] =
    useState<
      | PublicMemory
      | null
      | undefined
    >(undefined);

  useEffect(() => {
    let active =
      true;

    params.then(
      async ({
        code,
      }) => {
        try {
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
            if (active) {
              setMemory(
                null
              );
            }

            return;
          }

          const data =
            (await response.json()) as
              PublicMemory;

          if (active) {
            setMemory(
              data
            );
          }
        } catch {
          if (active) {
            setMemory(
              null
            );
          }
        }
      }
    );

    return () => {
      active =
        false;
    };
  }, [
    params,
  ]);

  if (
    memory ===
    undefined
  ) {
    return (
      <section className="smRecipientState">
        <div className="smRecipientStateMark">
          ♡
        </div>

        <span>
          SMART MEMORIES
        </span>

        <h1>
          Opening your
          memory...
        </h1>

        <div
          className="smRecipientLoadingLine"
          aria-hidden="true"
        >
          <span />
        </div>
      </section>
    );
  }

  if (!memory) {
    return (
      <section className="smRecipientState smRecipientMissing">
        <div className="smRecipientStateMark">
          ♡
        </div>

        <span>
          SMART MEMORIES
        </span>

        <h1>
          We couldn't find
          this Smart Memory.
        </h1>

        <p>
          Check the link or
          try tapping or
          scanning the gift
          again.
        </p>

        <Link
          href="/"
          className="smRecipientStateButton"
        >
          Go to Smart
          Memories
        </Link>
      </section>
    );
  }

  return (
    <RecipientMemoryExperience
      memory={
        memory
      }
    />
  );
}