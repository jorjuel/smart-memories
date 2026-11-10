'use client';

import { useRef } from 'react';
import { useCataloguePhoto } from '../lib/useCataloguePhoto';
import CardFront from './CardFront';
import CardZoomDialog from './CardZoomDialog';

export default function CardGalleryFront({ design, photoSlug }: { design: string; photoSlug: string }) {
  const { src, onError } = useCataloguePhoto(photoSlug);
  const photo = src;
  const dialog = useRef<HTMLDialogElement>(null);
  const artwork = photo ? (
    <div className="cardDesignPreview smCardFace">
      <img key={photo} className="smCardUploadedArt" src={photo} alt={design} onError={src ? onError : undefined} />
    </div>
  ) : <CardFront design={design} photoSlug={photoSlug} greeting="Especially for you" />;

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
