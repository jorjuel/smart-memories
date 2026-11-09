'use client';

import type { Product } from '../lib/products';
import { useCataloguePhoto } from '../lib/useCataloguePhoto';

export default function ProductVisual({
  p, detail = false,
}: { p: Product; detail?: boolean }) {
  const { src, onError } = useCataloguePhoto(p.slug);

  const cls = detail ? 'productHero productPhotoWrap' : 'productArt productPhotoWrap';
  return (
    <div className={cls}>
      {src ? (
        <img key={src} className="productPhoto" src={src} alt={p.name}
          loading={detail ? 'eager' : 'lazy'}
          onError={onError} />
      ) : (
        <span role="img" aria-label={p.name}>{p.emoji}</span>
      )}
    </div>
  );
}
