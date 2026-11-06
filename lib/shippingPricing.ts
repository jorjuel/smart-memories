/**
 * UK customer delivery pricing.
 *
 * Royal Mail 2026 Large Letter rates, 0–100g (effective 7 April 2026,
 * unchanged after 5 October price update): 2nd Class £1.55,
 * 1st Class online £3.20. See royalmail.com/current-postage-prices.
 *
 * The letter prices only apply to a single physical Memory Tag with bow,
 * assumed packed within 353 x 250 x 25mm and 100g. Verify dimensions and
 * weight of the finished envelope before accepting live payments.
 *
 * Never infer eligibility just because a gift happens to have a tag.
 */
export type ShippingMethod = 'standard' | 'express';

export type ShippingCartItem = {
  productType?: string;
  productSlug?: string;
  quantity?: number;
};

export const UK_SHIPPING_PENCE = {
  standard: 395,
  express: 695,
} as const;

export const ROYAL_MAIL_LARGE_LETTER_100G_PENCE = {
  standard: 155, // 2nd Class
  express: 320,  // 1st Class bought online, not guaranteed next day
} as const;

export function digitalOnlyCart(items: readonly ShippingCartItem[]): boolean {
  return items.length > 0 && items.every(item =>
    item.productType === 'product' && item.productSlug === 'digital-memory'
  );
}

export function singleMemoryTagLetterCart(items: readonly ShippingCartItem[]): boolean {
  return items.length === 1 &&
    items[0]?.productType === 'product' &&
    items[0]?.productSlug === 'memory-tag' &&
    Number(items[0]?.quantity ?? 1) === 1;
}

export function getCartShippingPricePence(
  items: readonly ShippingCartItem[],
  deliveryMethod: ShippingMethod
): number {
  if (digitalOnlyCart(items)) return 0;
  if (singleMemoryTagLetterCart(items)) {
    return ROYAL_MAIL_LARGE_LETTER_100G_PENCE[deliveryMethod];
  }
  return UK_SHIPPING_PENCE[deliveryMethod];
}
