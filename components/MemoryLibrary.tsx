'use client';

import {
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import MemoryCard from './MemoryCard';

import type {
  CustomerMemory,
} from '../lib/customerMemories';

type SortMode =
  | 'newest'
  | 'oldest'
  | 'alphabetical';

export default function MemoryLibrary({
  memories,
}: {
  memories: CustomerMemory[];
}) {
  const [
    search,
    setSearch,
  ] = useState('');

  const [
    sort,
    setSort,
  ] =
    useState<SortMode>(
      'newest'
    );

  const visible =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      const filtered =
        memories.filter(
          (memory) => {
            if (!query) {
              return true;
            }

            const gifts =
              memory.connectedGifts
                .map(
                  (gift) =>
                    [
                      gift.productName,
                      gift.occasion,
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        ' '
                      )
                )
                .join(
                  ' '
                );

            return [
              memory.recipient,
              gifts,
            ]
              .filter(
                Boolean
              )
              .join(' ')
              .toLowerCase()
              .includes(
                query
              );
          }
        );

      return [
        ...filtered,
      ].sort(
        (a, b) => {
          if (
            sort ===
            'oldest'
          ) {
            return (
              new Date(
                a.createdAt
              ).getTime() -
              new Date(
                b.createdAt
              ).getTime()
            );
          }

          if (
            sort ===
            'alphabetical'
          ) {
            return (
              a.recipient ||
              ''
            ).localeCompare(
              b.recipient ||
                ''
            );
          }

          return (
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
          );
        }
      );
    }, [
      memories,
      search,
      sort,
    ]);

  if (
    memories.length === 0
  ) {
    return (
      <div className="smMemoryEmpty">
        <div className="smMemoryEmptyIcon">
          ♡
        </div>

        <span className="v14Eyebrow">
          YOUR MEMORY LIBRARY
        </span>

        <h2>
          Your memories will
          live here.
        </h2>

        <p>
          Create your first
          Smart Memory and
          bring together a
          photograph, your
          voice and meaningful
          words in something
          they can tap and
          relive.
        </p>

        <Link
          href="/create"
          className="btn big"
        >
          Create My First
          Memory
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="smMemoryLibraryControls">
        <label>
          <span>
            Search your
            memories
          </span>

          <input
            type="search"
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target
                  .value
              )
            }
            placeholder="Search by person, occasion or gift..."
          />
        </label>

        <label>
          <span>
            Sort
          </span>

          <select
            value={
              sort
            }
            onChange={(
              event
            ) =>
              setSort(
                event.target
                  .value as
                  SortMode
              )
            }
          >
            <option value="newest">
              Newest first
            </option>

            <option value="oldest">
              Oldest first
            </option>

            <option value="alphabetical">
              Alphabetical
            </option>
          </select>
        </label>
      </div>

      {visible.length ===
      0 ? (
        <div className="smMemoryNoSearch">
          <h2>
            No memories match
            that search.
          </h2>

          <p>
            Try another person,
            occasion or gift.
          </p>

          <button
            type="button"
            className="btn secondary"
            onClick={() =>
              setSearch('')
            }
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="smMemoryLibraryGrid">
          {visible.map(
            (memory) => (
              <MemoryCard
                key={
                  memory.code
                }
                memory={
                  memory
                }
              />
            )
          )}
        </div>
      )}
    </>
  );
}