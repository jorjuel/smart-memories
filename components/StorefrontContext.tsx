'use client';

import { createContext, type ReactNode } from 'react';

export const GiftTagsOnlyContext = createContext(false);

export function StorefrontProvider({ giftTagsOnly, children }: { giftTagsOnly: boolean; children: ReactNode }) {
  return <GiftTagsOnlyContext.Provider value={giftTagsOnly}>{children}</GiftTagsOnlyContext.Provider>;
}
