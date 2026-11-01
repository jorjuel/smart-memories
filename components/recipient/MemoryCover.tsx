'use client';

import {
  useState,
} from 'react';

type Props = {
  recipient?: string | null;
  sender?: string | null;
  imageUrl?: string | null;
  onOpen: () => void;
};

export default function MemoryCover({
  recipient,
  sender,
  imageUrl,
  onOpen,
}: Props) {
  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  const name =
    recipient?.trim();

  return (
    <section className="smRecipientCover">
      <div className="smRecipientCoverMedia">
        {imageUrl &&
        !imageFailed ? (
          <img
            src={imageUrl}
            alt={
              name
                ? `A memory created for ${name}`
                : 'Smart Memory cover'
            }
            loading="eager"
            decoding="async"
            onError={() =>
              setImageFailed(
                true
              )
            }
          />
        ) : (
          <div className="smRecipientCoverFallback">
            <span>
              ♡
            </span>
          </div>
        )}

        <div className="smRecipientCoverShade" />
      </div>

      <div className="smRecipientCoverContent">
        <div className="smRecipientMiniBrand">
          SMART MEMORIES
          <span>♥</span>
        </div>

        <div className="smRecipientCoverWords">
          <span className="smRecipientOverline">
            A MEMORY CREATED
            ESPECIALLY FOR YOU
          </span>

          <h1>
            {name
              ? `For ${name}`
              : 'A Smart Memory for You'}
          </h1>

          {sender && (
            <p>
              Created for you by{' '}
              <strong>
                {sender}
              </strong>
            </p>
          )}

          <button
            type="button"
            className="smRecipientOpenButton"
            onClick={
              onOpen
            }
            aria-controls="memory-story"
          >
            Open Memory
            <span
              aria-hidden="true"
            >
              ↓
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}