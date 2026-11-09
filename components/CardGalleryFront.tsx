'use client';

import { useRef } from 'react';
import { useCataloguePhoto } from '../lib/useCataloguePhoto';
import CardFront from './CardFront';
import CardZoomDialog from './CardZoomDialog';

export default function CardGalleryFront({ design, photoSlug }: { design: string; photoSlug: string }) {
  const { src, onError } = useCataloguePhoto(photoSlug);
  const dialog = useRef<HTMLDialogElement>(null);
  const artwork = src ? (
    <div className="cardDesignPreview smCardFace">
      <img key={src} className="smCardUploadedArt" src={src} alt={design} onError={onError} />
    </div>
  ) : <CardFront design={design} greeting="Especially for you" />;

  return (
    <>
      <div className="smCardGalleryZoom">
        <button type="button" className="smCardZoomTrigger" aria-haspopup="dialog"
          aria-label={`Enlarge ${design}`} onClick={() => dialog.current?.showModal()}>
          <span>Enlarge</span>
        </button>
        <div className="smCardGalleryArt">{artwork}</div>
      </div>
      <CardZoomDialog dialog={dialog} title={design}>{artwork}</CardZoomDialog>
    </>
  );
}
