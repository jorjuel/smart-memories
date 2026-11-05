import { products } from './products';
import { bundles } from './bundles';

export const CARD_PRICES_PENCE = {
  traditional: 695,
  smart: 1195,
  printedPhoto: 150,
} as const;

export const SHIPPING_PRICES_PENCE = {
  standard: 395,
  express: 695,
} as const;

export function getProductPricePence(
  slug: string
) {
  if (slug === 'memory-tag') {
    const configured = process.env.MEMORY_TAG_PRICE_PENCE;
    const pricePence = configured ? Number(configured) : NaN;
    if (!Number.isInteger(pricePence) || pricePence <= 0) {
      throw new Error('Memory tag ordering is not yet available.');
    }
    return pricePence;
  }

  const product =
    products.find(
      (item) =>
        item.slug === slug
    );

  if (!product) {
    throw new Error(
      `Unknown product: ${slug}`
    );
  }

  return Math.round(
    product.price * 100
  );
}

export function getBundlePricePence(
  slug: string
) {
  const bundle =
    bundles.find(
      (item) =>
        item.slug === slug
    );

  if (!bundle) {
    throw new Error(
      `Unknown bundle: ${slug}`
    );
  }

  return Math.round(
    bundle.bundlePrice * 100
  );
}

export function getCardPricePence(
  cardType: 'traditional' | 'smart',
  includePrintedPhoto: boolean
) {
  const basePrice =
    CARD_PRICES_PENCE[
      cardType
    ];

  return (
    basePrice +
    (
      includePrintedPhoto
        ? CARD_PRICES_PENCE.printedPhoto
        : 0
    )
  );
}

export function getShippingPricePence(
  deliveryMethod:
    | 'standard'
    | 'express'
) {
  return SHIPPING_PRICES_PENCE[
    deliveryMethod
  ];
}