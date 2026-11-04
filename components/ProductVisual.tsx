'use client';

import { useEffect, useState } from 'react';
import type { Product } from '../lib/products';

type Catalog = { images?: Record<string, string> };

export default function ProductVisual({
  p, detail = false,
}: { p: Product; detail?: boolean }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch('/api/product-photos', { cache: 'no-store' });
        if (!response.ok) throw new Error('Product images unavailable');
        const catalog: Catalog = await response.json();
        if (active) setSrc(catalog.images?.[p.slug] || '');
      } catch {
        if (active) setSrc('');
      }
    }
    void load();
    window.addEventListener('sm-product-image-updated', load);
    return () => {
      active = false;
      window.removeEventListener('sm-product-image-updated', load);
    };
  }, [p.slug]);

  const cls = detail ? 'productHero productPhotoWrap' : 'productArt productPhotoWrap';
  return (
    <div className={cls}>
      {src ? (
        <img className="productPhoto" src={src} alt={p.name}
          loading={detail ? 'eager' : 'lazy'}
          onError={() => setSrc('')} />
      ) : (
        <span role="img" aria-label={p.name}>{p.emoji}</span>
      )}
    </div>
  );
}
