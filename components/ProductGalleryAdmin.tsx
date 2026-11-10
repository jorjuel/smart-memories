'use client';

import { useEffect, useRef, useState } from 'react';
import { compressProductImage } from '@/lib/productImages';
import CardZoomDialog from './CardZoomDialog';

type Photo = { path: string; url: string };
type Draft =
  | { action: 'Replace main photo' | 'Add gallery photo'; file: File }
  | { action: 'Make main photo' | 'Remove photo'; photo: Photo }
  | { action: 'Change price'; pricePence: number };

export default function ProductGalleryAdmin({ slug, name, main, pricePence, onSaved }: {
  slug: string;
  name: string;
  main?: string;
  pricePence: number;
  onSaved: () => Promise<void>;
}) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState('');
  const [draft, setDraft] = useState<Draft>();
  const [preview, setPreview] = useState('');
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [priceDraft, setPriceDraft] = useState<string>();
  const zoom = useRef<HTMLDialogElement>(null);
  const galleryUrl = '/api/admin-product-gallery?slug=' + encodeURIComponent(slug);

  useEffect(() => {
    const controller = new AbortController();
    fetch(galleryUrl, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load the gift gallery.');
        const data = await response.json();
        setPhotos(data.photos || []);
      })
      .catch((error) => { if (!controller.signal.aborted) setMessage(error.message); });
    return () => controller.abort();
  }, [galleryUrl]);

  useEffect(() => {
    if (!draft || !('file' in draft)) { setPreview(''); return; }
    const url = URL.createObjectURL(draft.file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [draft]);

  const angle = photos.find((photo) => photo.path === selected);
  const shown = draft && 'file' in draft ? preview : draft && 'photo' in draft ? draft.photo.url : angle?.url || main;

  async function apply() {
    if (!draft || busy) return;
    setBusy(true);
    setMessage('');
    try {
      const endpoint = draft.action === 'Change price' || draft.action === 'Replace main photo' || (draft.action === 'Remove photo' && !draft.photo.path)
        ? '/api/product-photos' : '/api/admin-product-gallery';
      let response: Response;
      if (draft.action === 'Change price') {
        response = await fetch(endpoint, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ giftSlug: slug, basePricePence: draft.pricePence }),
        });
      } else if ('file' in draft) {
        const body = new FormData();
        body.set('slug', slug);
        body.set('file', await compressProductImage(draft.file), slug + '.jpg');
        response = await fetch(endpoint, { method: 'POST', body });
      } else {
        response = await fetch(endpoint, {
          method: draft.action === 'Make main photo' ? 'PATCH' : 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, path: draft.photo.path }),
        });
      }
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || 'Could not apply the photo change.');
      setDraft(undefined);
      setReview(false);
      setSelected('');
      setMessage(draft.action === 'Change price' ? 'Gift price updated.' : 'Photo change applied.');
      setPriceDraft(undefined);
      if (draft.action === 'Change price') { await onSaved(); return; }
      const gallery = await fetch(galleryUrl, { cache: 'no-store' });
      if (!gallery.ok) throw new Error('Photo saved. Refresh the page to see the updated gallery.');
      setPhotos((await gallery.json()).photos || []);
      await onSaved();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not apply the photo change.');
    } finally {
      setBusy(false);
    }
  }

  return <div className="card adminCardEditor">
    <div className="adminCardPreview">
      <div className="adminCardPreviewHeading">
        <span className="eyebrow">{review ? 'REVIEW PREVIEW' : 'GIFT PREVIEW'}</span>
        {shown && <button type="button" className="smCardTextButton" aria-haspopup="dialog" onClick={() => zoom.current?.showModal()}>Enlarge preview</button>}
      </div>
      <div className="smCardPhotoGallery adminCardPhotoGallery">
        <div className="smCardPhotoThumbnails" role="group" aria-label="Gift photographs">
          {[{ path: '', url: main }, ...photos].map((photo, index) =>
            <button key={photo.path} type="button" disabled={Boolean(draft) || busy}
              aria-label={index ? 'Gallery photo ' + index : 'Main photo'}
              aria-pressed={selected === photo.path} onClick={() => setSelected(photo.path)}>
              {photo.url ? <img src={photo.url} alt="" /> : '1'}
            </button>
          )}
        </div>
        <div className="adminCardPhotoStage">
          {shown ? <img src={shown} alt={name} /> : <span>No photo yet</span>}
        </div>
      </div>
    </div>
    <div className="form adminCardFields">
      <h3>{name}</h3>
      {draft ? <>
        <p>{draft.action}{'file' in draft ? ' · ' + draft.file.name : ''}
          {draft.action === 'Change price' && <> from £{(pricePence / 100).toFixed(2)} to £{(draft.pricePence / 100).toFixed(2)}</>}
        </p>
        <div className="adminCardActions">
          {review
            ? <button type="button" className="btn small" disabled={busy} onClick={() => void apply()}>{busy ? 'Applying…' : 'Apply changes'}</button>
            : <button type="button" className="btn small" onClick={() => setReview(true)}>Review changes</button>}
          <button type="button" className="smCardTextButton" disabled={busy}
            onClick={() => {
              if (draft.action === 'Change price') setPriceDraft(undefined);
              setDraft(undefined);
              setReview(false);
              setMessage('');
            }}>Discard change</button>
        </div>
      </> : <>
        <form className="form adminCardFields" onSubmit={(event) => {
          event.preventDefault();
          const next = Math.round(Number(priceDraft) * 100);
          if (!Number.isSafeInteger(next) || next < 1 || next > 99999 || next === pricePence) return;
          setDraft({ action: 'Change price', pricePence: next });
          setReview(true);
          setMessage('');
        }}>
          <label>Gift price (£)<input type="number" min="0.01" max="999.99" step="0.01" required
            value={priceDraft ?? (pricePence / 100).toFixed(2)} onChange={(event) => setPriceDraft(event.target.value)} /></label>
          <button type="submit" className="btn small" disabled={busy || priceDraft === undefined || Math.round(Number(priceDraft) * 100) === pricePence}>Review price change</button>
        </form>
        <div className="adminCardActions">
        {(['Replace main photo', 'Add gallery photo'] as const).map((action) => (
          <label key={action} className="btn small uploadBtn">{!main && action === 'Replace main photo' ? 'Add main photo' : action}
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) { setDraft({ action, file }); setMessage(''); }
              event.currentTarget.value = '';
            }} />
          </label>
        ))}
        {angle && <button type="button" className="smCardTextButton" disabled={busy}
          onClick={() => setDraft({ action: 'Make main photo', photo: angle })}>Make main photo</button>}
        {(angle || main) && <button type="button" className="smCardTextButton" disabled={busy}
          onClick={() => setDraft({ action: 'Remove photo', photo: angle ?? { path: '', url: main! } })}>Remove selected photo</button>}
        </div>
      </>}
      {message && <p role="status">{message}</p>}
    </div>
    <CardZoomDialog dialog={zoom} title={name}>
      {shown && <img className="adminCardEnlargedPhoto" src={shown} alt={name} />}
    </CardZoomDialog>
  </div>;
}
