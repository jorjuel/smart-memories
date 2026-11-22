'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { giftTagPackSize } from '@/lib/giftTagPackPricing';
import type { GiftTagDesign } from '@/lib/giftTagCatalogue';
import GiftTagCollections from './GiftTagCollections';

const categories = [
  { title: 'Christmas', sources: ['Christmas', 'Christmas Keepsakes', 'Santa Claus', 'Winter Candles', 'Winter Forest', 'Funny Christmas Cows'] },
  { title: 'Wedding', sources: ['Wedding'] },
  { title: 'Flowers & Nature', sources: ['Flowers and Nature', 'Flowers & Nature', 'Blue Roses', 'Woodland Mushrooms'] },
  { title: 'Birthday Celebrations', sources: ['Birthday Celebrations', 'Birthday'] },
  { title: 'Animals', sources: ['Animals'] },
  { title: 'Messages', sources: ['Messages', 'New Baby', 'Halloween', 'Line Art'] },
  { title: 'Thank You', sources: ['Thank You'] },
];

const occasions = [
  { title: 'Birthdays', icon: '🎂', category: 'Birthday Celebrations' },
  { title: 'Weddings', icon: '💍', category: 'Wedding' },
  { title: 'Anniversaries', icon: '❤️', category: 'Messages', design: 'template-love-note-heart' },
  { title: 'Christmas', icon: '🎄', category: 'Christmas' },
  { title: 'Pet memories', icon: '🐾', category: 'Animals' },
  { title: 'New baby gifts', icon: '👶', category: 'Thank You', design: 'baby-clothes-thank-you', customFallback: true },
];

export default function GiftTagSelection({ code, tags, intro, children }: {
  code?: string;
  tags: GiftTagDesign[] | null;
  intro?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [active, setActive] = useState('Christmas');
  const [featured, setFeatured] = useState<string>();
  const collections = categories.map(category => ({
    title: category.title,
    designs: (tags ?? []).filter(tag => category.sources.includes(tag.collection) ||
      (category.title === 'Messages' && !categories.some(group => group.sources.includes(tag.collection)))),
  })).filter(({ designs }) => designs.length);
  const current = collections.some(({ title }) => title === active) ? active : collections[0]?.title;

  function toggle(id: string) {
    setSelected(current => current.includes(id)
      ? current.filter(selectedId => selectedId !== id)
      : [...current, id]);
  }

  return (
    <>
      {!code && (
        <>
          {collections.length > 0 && (
            <nav className="smTagOccasions" aria-labelledby="tag-occasions-title">
              <h2 id="tag-occasions-title">Perfect for</h2>
              <ul>
                {occasions.map(occasion => {
                  const collection = collections.find(({ title }) => title === occasion.category);
                  const design = collection?.designs.find(({ id }) => id === occasion.design);
                  const useCustom = occasion.customFallback && !design;
                  if (!collection && !useCustom) return null;

                  return (
                    <li key={occasion.title}>
                      <a href={useCustom ? '#tag-custom-artwork' : '#tag-designs'} onClick={useCustom ? undefined : () => {
                        setActive(occasion.category);
                        setFeatured(design?.id);
                      }}>
                        <span aria-hidden="true">{occasion.icon}</span> {occasion.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
          {intro}
        </>
      )}

      <section className="wrap smTagStorefront" id="tag-designs" aria-labelledby="tag-designs-title" tabIndex={-1}>
        <div className="smTagStorefrontHeading">
          {code ? <h1 id="tag-designs-title">Choose another tag for your memory</h1>
            : <h2 id="tag-designs-title">Choose your tags</h2>}
          <p>Choose a design, add your memory and pick a satin bow.</p>
        </div>
        {!tags && <p role="status">Gift Tags are temporarily unavailable. Please try again shortly.</p>}
        {tags?.length === 0 && <p>No ready-made designs are available right now.</p>}
        <form action={code ? '/create/bow' : '/create'}
          onSubmit={event => {
            event.preventDefault();
            if (!selected.length) return;
            const query = new URLSearchParams(code ? { code } : { mode: 'tag' });
            selected.forEach(id => query.append('selection', id));
            router.push(`${code ? '/create/bow' : '/create'}?${query}`);
          }}>
          {current && <GiftTagCollections collections={collections} active={current} featured={featured}
            selected={selected} onToggle={toggle} onChange={title => {
              setActive(title);
              setFeatured(undefined);
            }} />}
          <label id="tag-custom-artwork" className="smTagSelectOption smTagCustomChoice" tabIndex={-1}>
            <input type="checkbox" checked={selected.includes('custom')} onChange={() => toggle('custom')} />
            <span><strong>Use your own artwork</strong><small>Upload an image to print on your tag.</small></span>
          </label>
          <div className="smTagSelectionActions">
            <span className="smTagSelectionStatus" aria-live="polite">
              <strong>{selected.length ? `${selected.length} selected` : 'Select a design to start'}</strong>
              {selected.length > 0 && selected.length < giftTagPackSize &&
                <small>Choose {giftTagPackSize - selected.length} more for the offer</small>}
              {selected.length >= giftTagPackSize && <small>Mix-and-match pricing applies in the basket</small>}
            </span>
            <button type="submit" className="btn" disabled={!selected.length}>Personalise tags</button>
          </div>
        </form>
        {children}
      </section>
    </>
  );
}
