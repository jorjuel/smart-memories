'use client';

import { useId, useState, type ReactNode } from 'react';
import GiftTagCarousel from './GiftTagCarousel';

export default function GiftTagCollections({ collections }: {
  collections: { title: string; cards: ReactNode }[];
}) {
  const id = useId();
  const [active, setActive] = useState(0);
  if (!collections.length) return null;

  return (
    <div className="smTagStorefrontCollection">
      <div className="smTagCollectionNav" role="tablist" aria-label="Tag collections">
        {collections.map(({ title }, index) => (
          <button key={title} type="button" role="tab" id={`${id}-tab-${index}`}
            aria-selected={active === index} aria-controls={`${id}-panel-${index}`}
            tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)}
            onKeyDown={(event) => {
              const last = collections.length - 1;
              const destinations: Record<string, number> = {
                ArrowLeft: index === 0 ? last : index - 1,
                ArrowRight: index === last ? 0 : index + 1,
                Home: 0,
                End: last,
              };
              const next = destinations[event.key];
              if (next === undefined) return;
              event.preventDefault();
              setActive(next);
              document.getElementById(`${id}-tab-${next}`)?.focus();
            }}>
            {title}
          </button>
        ))}
      </div>
      {collections.map(({ title, cards }, index) => (
        <div key={title} role="tabpanel" id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`} hidden={active !== index}>
          <GiftTagCarousel title={title}>{cards}</GiftTagCarousel>
        </div>
      ))}
    </div>
  );
}
