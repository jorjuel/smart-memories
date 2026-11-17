'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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
        <span aria-live="polite">{selected.length} selected</span>
        <button type="submit" className="btn" disabled={!selected.length}>Personalise selected tags</button>
      </div>
    </form>
  );
}
