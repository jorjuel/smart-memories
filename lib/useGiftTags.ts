'use client';

import { useEffect, useState } from 'react';
import type { GiftTagDesign } from './giftTagCatalogue';

export function useGiftTags(enabled = true) {
  const [tags, setTags] = useState<GiftTagDesign[]>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    fetch('/api/gift-tags', { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Could not load Gift Tags.');
        setTags((await response.json()).tags);
      })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [enabled]);
  return { tags, failed };
}
