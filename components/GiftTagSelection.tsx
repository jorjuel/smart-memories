'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { giftTagPackSize } from '@/lib/giftTagPackPricing';

export default function GiftTagSelection({ code, children }: { code?: string; children: ReactNode }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <form action={code ? '/create/bow' : '/create'}
      onChange={(event) => {
        const input = event.target;
        if (!(input instanceof HTMLInputElement) || input.name !== 'selection') return;
        setSelected(current => input.checked
          ? [...current.filter(id => id !== input.value), input.value]
          : current.filter(id => id !== input.value));
      }}
      onSubmit={(event) => {
        event.preventDefault();
        if (!selected.length) return;
        const query = new URLSearchParams(code ? { code } : { mode: 'tag' });
        selected.forEach(id => query.append('selection', id));
        router.push(`${code ? '/create/bow' : '/create'}?${query}`);
      }}>
      {code ? <input type="hidden" name="code" value={code} /> : <input type="hidden" name="mode" value="tag" />}
      {children}
      <div className="smTagSelectionActions">
        <span className="smTagSelectionStatus" aria-live="polite">
          <strong>{selected.length} selected</strong>
          {selected.length > 0 && selected.length < giftTagPackSize &&
            <small>Choose {giftTagPackSize - selected.length} more for the offer</small>}
          {selected.length >= giftTagPackSize && <small>Mix-and-match pricing applies in the basket</small>}
        </span>
        <button type="submit" className="btn" disabled={!selected.length}>Personalise tags</button>
      </div>
    </form>
  );
}
