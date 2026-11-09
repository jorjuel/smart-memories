'use client';

import { useState } from 'react';
import CardFront from './CardFront';
import { cardDesigns, type SavedCardPreview } from '../lib/cardDesigns';
import { useCataloguePhoto } from '../lib/useCataloguePhoto';

export default function BasketCardPreview({
  design, imageUrl, name, recipient, preview, smart,
}: {
  design?: string;
  imageUrl?: string | null;
  name: string;
  recipient?: string;
  preview?: SavedCardPreview;
  smart: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const savedPhoto = imageUrl && failedUrl !== imageUrl ? imageUrl : undefined;
  const photoSlug = cardDesigns.find((card) => card.name === design)?.photoSlug;
  const { src: cataloguePhoto, onError: onCatalogueError } = useCataloguePhoto(savedPhoto ? undefined : photoSlug);
  const cover = savedPhoto || cataloguePhoto;

  return (
    <div className="finalPreview smBasketCardPreview">
      {savedPhoto && preview?.printedPhoto ? (
        <CardFront design={design || name} greeting={preview.greeting} recipient={recipient}
          colour={preview.colour} photo={savedPhoto} smart={smart}
          onPhotoError={() => setFailedUrl(savedPhoto)} />
      ) : cover ? (
        <img key={cover} className="smBasketCardPhoto" src={cover} alt={design || name}
          onError={savedPhoto ? () => setFailedUrl(savedPhoto) : onCatalogueError} />
      ) : (
        <CardFront design={design || name} greeting={preview?.greeting || 'Especially for you'}
          recipient={recipient} colour={preview?.colour} smart={smart} />
      )}
    </div>
  );
}
