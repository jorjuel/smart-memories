export const giftTagsOnly = true;

export function isPurchasableProduct(slug: unknown) {
  return !giftTagsOnly || slug === 'memory-tag';
}
