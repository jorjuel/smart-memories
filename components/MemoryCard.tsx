import Link from 'next/link';

import type {
  CustomerMemory,
} from '../lib/customerMemories';

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    'en-GB',
    {
      dateStyle:
        'medium',
    }
  ).format(
    new Date(value)
  );
}

export default function MemoryCard({
  memory,
}: {
  memory: CustomerMemory;
}) {
  const gift =
    memory
      .connectedGifts[0];

  const title =
    memory.recipient
      ? `Memory for ${memory.recipient}`
      : 'Your Smart Memory';

  return (
    <article className="smMemoryLibraryCard">
      <div className="smMemoryCardCover">
        {memory.photoUrl ? (
          <img
            src={
              memory.photoUrl
            }
            alt={
              memory.recipient
                ? `Smart Memory for ${memory.recipient}`
                : 'Smart Memory photograph'
            }
            loading="lazy"
          />
        ) : (
          <div className="smMemoryCardPlaceholder">
            <span>♡</span>

            <strong>
              Smart Memory
            </strong>
          </div>
        )}

        {gift?.occasion && (
          <span className="smMemoryCardOccasion">
            {
              gift.occasion
            }
          </span>
        )}
      </div>

      <div className="smMemoryCardBody">
        <span className="eyebrow">
          SMART MEMORY
        </span>

        <h2>
          {title}
        </h2>

        {gift && (
          <p className="smMemoryConnectedGift">
            Connected to{' '}
            <strong>
              {
                gift.productName
              }
            </strong>
          </p>
        )}

        <p className="smMemoryCreated">
          Created{' '}
          {formatDate(
            memory.createdAt
          )}
        </p>

        <div className="smMemoryIndicators">
          <span>
            📷{' '}
            {memory.photoUrl
              ? '1 photo'
              : 'No photo'}
          </span>

          <span>
            🎙{' '}
            {memory.audioUrl
              ? 'Voice included'
              : 'No voice'}
          </span>

          {memory.videoUrl && (
            <span>
              🎥 Video included
            </span>
          )}
        </div>

        <div className="smMemoryCardActions">
          <a
            href={`/memories/${memory.code}`}
            className="btn"
          >
            View Memory
          </a>

          <Link
            href={`/m/${memory.code}`}
            className="btn secondary"
          >
            Recipient View
          </Link>
        </div>
      </div>
    </article>
  );
}
