'use client';

import Image from 'next/image';
import { useId } from 'react';
import type { GiftTagDesign } from '@/lib/giftTagCatalogue';
import GiftTagCarousel from './GiftTagCarousel';
import GiftTagPreview from './GiftTagPreview';

export default function GiftTagCollections({ collections, active, featured, selected, onChange, onToggle }: {
  collections: { title: string; designs: GiftTagDesign[] }[];
  active: string;
  featured?: string;
  selected: string[];
  onChange: (title: string) => void;
  onToggle: (id: string) => void;
}) {
  const id = useId();
  const activeIndex = collections.findIndex(({ title }) => title === active);
  const designs = collections[activeIndex]?.designs ?? [];
  const highlighted = designs.find(design => design.id === featured);
  const cards = highlighted ? [highlighted, ...designs.filter(design => design !== highlighted)] : designs;

  return (
    <div className="smTagStorefrontCollection">
      <div className="smTagCollectionNav" role="tablist" aria-label="Tag collections">
        {collections.map(({ title }, index) => (
          <button key={title} type="button" role="tab" id={`${id}-tab-${index}`}
            aria-selected={active === title} aria-controls={`${id}-panel`}
            tabIndex={active === title ? 0 : -1} onClick={() => onChange(title)}
            onKeyDown={event => {
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
              onChange(collections[next].title);
              document.getElementById(`${id}-tab-${next}`)?.focus();
            }}>
            {title}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${activeIndex}`}>
        <GiftTagCarousel title={active} key={`${active}:${featured ?? ''}`}>
          {cards.map(design => (
            <article key={design.id} className="smBowColour smTagDesignChoice">
              <GiftTagPreview name={design.name} image={design.image}>
                <Image src={design.image} alt="" width={160} height={210}
                  sizes="(max-width: 600px) 38vw, 160px" unoptimized={design.image.startsWith('https://')} />
              </GiftTagPreview>
              <strong>{design.name}</strong>
              {design.description && <p>{design.description}</p>}
              <label className="smTagSelectOption">
                <input type="checkbox" checked={selected.includes(design.id)} onChange={() => onToggle(design.id)}
                  aria-label={`Select ${design.name}`} />
                {selected.includes(design.id) ? 'Selected' : 'Select'}
              </label>
            </article>
          ))}
        </GiftTagCarousel>
      </div>
    </div>
  );
}
