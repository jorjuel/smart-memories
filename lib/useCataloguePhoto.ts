'use client';

import { useEffect, useState } from 'react';
import type { CatalogueCard } from './cardDesigns';

type Catalogue = { images?: Record<string, string>; cards?: CatalogueCard[]; giftPrices?: Record<string, number> };

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
  const [photo, setPhoto] = useState<Catalogue & { slug: string }>();
  const images = photo?.slug === slug ? photo?.images : undefined;
  const src = slug ? images?.[slug] || '' : '';

  useEffect(() => {
    if (!slug) return;
    const photoSlug = slug;
    let requestId = 0;
    async function load() {
      const id = ++requestId;
      try {
        const catalogue = await loadCatalogue();
        if (id === requestId) setPhoto({ ...catalogue, slug: photoSlug });
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

  function onError(failedSlug = slug) {
    if (!failedSlug) return;
    setPhoto((current) => {
      if (!current || current.slug !== slug || current.images?.[failedSlug] !== images?.[failedSlug] || !current.images?.[failedSlug]) return current;
      const remaining = { ...current.images };
      delete remaining[failedSlug];
      return { ...current, images: remaining };
    });
  }

  return { src, images, cards: photo?.slug === slug ? photo?.cards : undefined, giftPrices: photo?.slug === slug ? photo?.giftPrices : undefined, onError: () => onError(), removeUnavailablePhoto: onError };
}

export function useGiftPrice(slug: string | undefined, fallback: number) {
  const { giftPrices } = useCataloguePhoto(slug);
  const price = slug ? giftPrices?.[slug] : undefined;
  return price === undefined ? fallback : price / 100;
}
