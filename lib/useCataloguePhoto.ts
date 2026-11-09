'use client';

import { useEffect, useState } from 'react';

type Catalogue = { images?: Record<string, string> };

let pendingCatalogue: Promise<Catalogue> | undefined;

function loadCatalogue() {
  pendingCatalogue ??= fetch('/api/product-photos', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error('Product images unavailable');
      return response.json() as Promise<Catalogue>;
    })
    .finally(() => { pendingCatalogue = undefined; });
  return pendingCatalogue;
}

export function useCataloguePhoto(slug?: string) {
  const [photo, setPhoto] = useState<{ slug: string; src: string }>();
  const src = photo?.slug === slug ? photo?.src || '' : '';

  useEffect(() => {
    if (!slug) return;
    const photoSlug = slug;
    let requestId = 0;
    async function load() {
      const id = ++requestId;
      try {
        const catalogue = await loadCatalogue();
        if (id === requestId) setPhoto({ slug: photoSlug, src: catalogue.images?.[photoSlug] || '' });
      } catch {
        if (id === requestId) setPhoto(undefined);
      }
    }
    void load();
    window.addEventListener('sm-product-image-updated', load);
    return () => {
      requestId++;
      window.removeEventListener('sm-product-image-updated', load);
    };
  }, [slug]);

  return { src, onError: () => setPhoto((current) => current === photo ? undefined : current) };
}
