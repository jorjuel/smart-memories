'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { GiftTagDesign } from '@/lib/giftTagCatalogue';
import { compressProductImage } from '@/lib/productImages';

async function getTags(): Promise<GiftTagDesign[]> {
  const response = await fetch('/api/gift-tags', { cache: 'no-store' });
  if (!response.ok) throw new Error('Could not load Gift Tags.');
  return (await response.json()).tags;
}

export default function AdminGiftTags({ disabled }: { disabled: boolean }) {
  const [tags, setTags] = useState<GiftTagDesign[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmRemoval, setConfirmRemoval] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [editorVersion, setEditorVersion] = useState(0);
  const selected = tags.find(tag => tag.id === selectedId);

  useEffect(() => {
    void getTags().then(setTags).catch(() => setError('Could not load Gift Tags.'));
  }, []);

  async function update(form: FormData, removing = false) {
    setBusy(true);
    setStatus('');
    setError('');
    try {
      form.set('action', removing ? 'remove-gift-tag' : 'save-gift-tag');
      if (selected) form.set('id', selected.id);
      const file = form.get('file');
      form.delete('file');
      if (file instanceof File && file.size) {
        form.set('file', await compressProductImage(file), 'gift-tag.jpg');
      }
      const response = await fetch('/api/product-photos', { method: 'POST', body: form });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || 'Could not update the Gift Tag.');
      if (removing) setSelectedId('');
      else if (result?.id) setSelectedId(result.id);
      setConfirmRemoval(false);
      setEditorVersion(version => version + 1);
      setStatus(removing ? 'Gift Tag removed from the shop.' : 'Gift Tag saved.');
      setTags(await getTags());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update the Gift Tag.');
    } finally {
      setBusy(false);
    }
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void update(new FormData(event.currentTarget));
  }

  return (
    <section>
      <h2>Gift Tags</h2>
      <label className="adminCardSelector">Tag design
        <select value={selectedId} disabled={busy} onChange={event => {
          setSelectedId(event.target.value);
          setConfirmRemoval(false);
          setError('');
          setStatus('');
        }}>
          <option value="">＋ Add a new Gift Tag</option>
          {tags.map(tag => <option key={tag.id} value={tag.id}>{tag.collection} · {tag.name}</option>)}
        </select>
      </label>
      <div className="card adminCardEditor">
        {selected && <div className="adminCardPhotoStage"><img src={selected.image} alt={selected.name} /></div>}
        {confirmRemoval ? (
          <div className="form adminCardFields">
            <h3>Remove {selected?.name}?</h3>
            <p>The design will disappear from the Gift Tags gallery.</p>
            <div className="adminCardActions">
              <button type="button" className="btn small" disabled={disabled || busy}
                onClick={() => void update(new FormData(), true)}>Confirm removal</button>
              <button type="button" className="smCardTextButton" disabled={busy}
                onClick={() => setConfirmRemoval(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <form key={`${selectedId}:${editorVersion}`} className="form adminCardFields" onSubmit={save}>
            <label>Tag title<input name="name" required maxLength={100} defaultValue={selected?.name} /></label>
            <label>Collection<input name="collection" required maxLength={60} defaultValue={selected?.collection} /></label>
            <label>Description<textarea name="description" maxLength={500} defaultValue={selected?.description} /></label>
            <label>{selected ? 'Replace photo (optional)' : 'Tag photo'}
              <input type="file" name="file" accept="image/jpeg,image/png,image/webp" required={!selected} />
            </label>
            <div className="adminCardActions">
              <button className="btn small" disabled={disabled || busy}>{busy ? 'Saving…' : 'Save Gift Tag'}</button>
              {selected && <button type="button" className="smCardTextButton" disabled={disabled || busy}
                onClick={() => setConfirmRemoval(true)}>Remove Gift Tag</button>}
            </div>
          </form>
        )}
      </div>
      {status && <p role="status">{status}</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
