'use client';

import { useEffect, useRef, useState } from 'react';
import { cardPhotoSlugs, type CatalogueCard } from '../lib/cardDesigns';
import { compressProductImage } from '../lib/productImages';
import CardZoomDialog from './CardZoomDialog';

const labels = ['Main photo', 'Angle 2', 'Angle 3', 'Angle 4'];

async function saveRequest(method: string, body: FormData | object) {
  const response = await fetch('/api/product-photos', {
    method,
    ...(body instanceof FormData ? { body } : {
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || `Save failed (HTTP ${response.status}).`);
  return result;
}

export default function AdminCardEditor({ card, images, disabled, onSaved, onRemoved }: {
  card?: CatalogueCard;
  images: Record<string, string>;
  disabled: boolean;
  onSaved: (slug: string) => Promise<void>;
  onRemoved: () => Promise<void>;
}) {
  const [name, setName] = useState(card?.name ?? '');
  const [price, setPrice] = useState(((card?.basePricePence ?? 695) / 100).toFixed(2));
  const [photos, setPhotos] = useState<Record<number, File | null>>({});
  const [previews, setPreviews] = useState<Record<number, string>>({});
  const [angle, setAngle] = useState(0);
  const [review, setReview] = useState(false);
  const [confirmRemoval, setConfirmRemoval] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const slug = useRef(card?.photoSlug);
  const zoom = useRef<HTMLDialogElement>(null);
  const savedDetails = useRef(card ? { name: card.name, basePricePence: card.basePricePence } : undefined);
  const savedPhotos = useRef(new Map<number, File | null>());
  const slugs = card ? cardPhotoSlugs(card.photoSlug) : [];
  const basePricePence = Math.round(Number(price) * 100);
  const detailsChanged = name.trim() !== savedDetails.current?.name || basePricePence !== savedDetails.current?.basePricePence;
  const changedPhotos = Object.entries(photos);
  const canReview = Boolean(name.trim()) && (detailsChanged || changedPhotos.length > 0);

  useEffect(() => {
    const urls: Record<number, string> = {};
    for (const [index, file] of Object.entries(photos)) {
      if (file) urls[Number(index)] = URL.createObjectURL(file);
    }
    setPreviews(urls);
    return () => Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
  }, [photos]);

  function photoAt(index: number) {
    if (photos[index] === null) return undefined;
    return photos[index] ? previews[index] : images[slugs[index]];
  }

  async function apply() {
    setBusy(true);
    setError('');
    try {
      const prepared = await Promise.all(changedPhotos
        .filter(([index, file]) => savedPhotos.current.get(Number(index)) !== file)
        .map(async ([index, file]) => ({
          index: Number(index), file, image: file ? await compressProductImage(file) : null,
        })));
      if (detailsChanged) {
        const saved = await saveRequest('PATCH', { photoSlug: slug.current, name: name.trim(), basePricePence });
        slug.current = saved.photoSlug;
        savedDetails.current = { name: name.trim(), basePricePence };
      }
      if (!slug.current) throw new Error('The card could not be identified.');
      const targets = cardPhotoSlugs(slug.current);
      for (const { index, file, image } of prepared) {
        const target = targets[index];
        try {
          if (image) {
            const form = new FormData();
            form.set('slug', target);
            form.set('file', image, `${target}.jpg`);
            await saveRequest('POST', form);
          } else {
            await saveRequest('DELETE', { slug: target });
          }
          savedPhotos.current.set(index, file);
        } catch (cause) {
          throw new Error(`${labels[index]}: ${cause instanceof Error ? cause.message : 'Could not save photo.'}`);
        }
      }
      await onSaved(slug.current);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Could not apply changes.';
      const partlySaved = savedPhotos.current.size > 0 || (savedDetails.current &&
        (savedDetails.current.name !== card?.name || savedDetails.current.basePricePence !== card?.basePricePence));
      setError(partlySaved ? `${message} Some changes were saved. Retry to finish applying this draft.` : message);
    } finally {
      setBusy(false);
    }
  }

  async function removeCard() {
    if (!card) return;
    setBusy(true);
    setError('');
    try {
      await saveRequest('PATCH', { action: 'archive-card', photoSlug: card.photoSlug });
      await onRemoved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not remove the card.');
    } finally {
      setBusy(false);
    }
  }

  const selectedPhoto = photoAt(angle);
  return (
    <form className="card adminCardEditor" onSubmit={(event) => {
      event.preventDefault();
      setError('');
      setReview(true);
    }}>
      <div className="adminCardPreview">
        <div className="adminCardPreviewHeading">
          <span className="eyebrow">{review ? 'REVIEW PREVIEW' : 'DESIGN PREVIEW'}</span>
          {selectedPhoto && <button type="button" className="smCardTextButton" aria-haspopup="dialog"
            onClick={() => zoom.current?.showModal()}>Enlarge preview</button>}
        </div>
        <div className="smCardPhotoGallery adminCardPhotoGallery">
          <div className="smCardPhotoThumbnails" role="group" aria-label="Card photo angles">
            {labels.map((label, index) => {
              const src = photoAt(index);
              return <button key={label} type="button" aria-label={label} aria-pressed={angle === index}
                onClick={() => setAngle(index)}>{src ? <img src={src} alt="" /> : index + 1}</button>;
            })}
          </div>
          <div className="adminCardPhotoStage">
            {selectedPhoto ? <img src={selectedPhoto} alt={labels[angle]} /> : <span>No photo for {labels[angle].toLowerCase()}</span>}
          </div>
        </div>
        {!review && <div className="adminCardActions">
          <label className="btn small uploadBtn">
            {selectedPhoto ? 'Replace' : 'Add'} {labels[angle].toLowerCase()}
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setPhotos((current) => ({ ...current, [angle]: file }));
                event.currentTarget.value = '';
              }} />
          </label>
          {Object.hasOwn(photos, angle) ? photos[angle] !== savedPhotos.current.get(angle) && (
            <button type="button" className="smCardTextButton" onClick={() => {
              const savedPhoto = savedPhotos.current.get(angle);
              setPhotos(({ [angle]: discarded, ...remaining }) => savedPhoto === undefined ? remaining : { ...remaining, [angle]: savedPhoto });
            }}>Undo photo change</button>
          ) : images[slugs[angle]] && (
            <button type="button" className="smCardTextButton" onClick={() => setPhotos((current) => ({ ...current, [angle]: null }))}>
              Remove photo
            </button>
          )}
        </div>}
      </div>
      <div className="form adminCardFields">
        {confirmRemoval ? <>
          <h3>Remove {card?.name}?</h3>
          <p>This design will disappear from the shop. Existing orders and photos are kept.</p>
          <div className="adminCardActions">
            <button type="button" className="btn small" disabled={busy || disabled}
              onClick={() => void removeCard()}>{busy ? 'Removing…' : 'Confirm removal'}</button>
            <button type="button" className="smCardTextButton" disabled={busy}
              onClick={() => setConfirmRemoval(false)}>Cancel</button>
          </div>
        </> : review ? <>
          <h3>Review changes</h3>
          <p><strong>{name.trim()}</strong> · £{(basePricePence / 100).toFixed(2)} base price</p>
          {changedPhotos.length > 0 && <ul>{changedPhotos.map(([index, file]) => (
            <li key={index}>{labels[Number(index)]}: {file ? file.name : 'Remove photo'}</li>
          ))}</ul>}
          <div className="adminCardActions">
            <button type="button" className="btn small" disabled={busy || disabled} onClick={() => void apply()}>{busy ? 'Applying…' : 'Apply changes'}</button>
            <button type="button" className="smCardTextButton" disabled={busy} onClick={() => setReview(false)}>Back to editing</button>
          </div>
        </> : <>
          <label>Card title<input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label>Base price (£)<input required type="number" min="0.01" max="999.99" step="0.01" value={price}
            onChange={(event) => setPrice(event.target.value)} /></label>
          <button type="submit" className="btn small" disabled={disabled || !canReview}>Review changes</button>
          {card && <button type="button" className="smCardTextButton" disabled={disabled}
            onClick={() => { setError(''); setConfirmRemoval(true); }}>Remove card design</button>}
        </>}
        {error && <p role="alert">{error}</p>}
      </div>
      <CardZoomDialog dialog={zoom} title={`${name.trim() || 'Card'} · ${labels[angle]}`}>
        {selectedPhoto && <img className="adminCardEnlargedPhoto" src={selectedPhoto} alt={labels[angle]} />}
      </CardZoomDialog>
    </form>
  );
}
