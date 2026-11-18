export const giftTagPricePence = 799;
export const giftTagPackSize = 3;
export const giftTagPackPricePence = 1999;

type TagCartLine = { productType?: string; productSlug?: string; quantity: number };

export function isGiftTag(item: TagCartLine) {
  return item.productType === 'product' && item.productSlug === 'memory-tag';
}

export function countGiftTagPacks(items: readonly TagCartLine[]) {
  const tags = items.reduce((total, item) => total + (isGiftTag(item) ? item.quantity : 0), 0);
  return Math.floor(tags / giftTagPackSize);
}

export function giftTagPackSavings(items: readonly TagCartLine[]) {
  return countGiftTagPacks(items) * (giftTagPackSize * giftTagPricePence - giftTagPackPricePence);
}

// Stripe and order rows use whole-penny unit prices. Split only when a line
// spans different rates, preserving the design and memory on each row.
export function applyGiftTagPackPricing<T extends TagCartLine & { unitPricePence: number }>(items: readonly T[]): T[] {
  const packs = countGiftTagPacks(items);
  let discounted = packs * giftTagPackSize;
  const base = Math.floor(giftTagPackPricePence / giftTagPackSize);
  let extraPennies = packs * (giftTagPackPricePence % giftTagPackSize);
  return items.flatMap(item => {
    if (!isGiftTag(item) || !discounted) return [item];
    const packUnits = Math.min(item.quantity, discounted);
    const higherRateUnits = Math.min(packUnits, extraPennies);
    discounted -= packUnits;
    extraPennies -= higherRateUnits;
    return [
      { ...item, quantity: higherRateUnits, unitPricePence: base + 1 },
      { ...item, quantity: packUnits - higherRateUnits, unitPricePence: base },
      { ...item, quantity: item.quantity - packUnits },
    ].filter(line => line.quantity > 0);
  });
}
