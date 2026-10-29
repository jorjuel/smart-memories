'use client';

import ProductVisual from './ProductVisual';
import { products } from '../lib/products';

type Props = {
  productType: string;
  productSlug?: string;
  imageUrl?: string | null;
  name: string;
};

export default function BasketProductVisual({
  productType,
  productSlug,
  imageUrl,
  name,
}: Props) {
  /*
   * Normal shop products:
   * use the real Smart Memories product visual.
   */
  if (productType === 'product' && productSlug) {
    const product = products.find(
      (item) => item.slug === productSlug
    );

    if (product) {
      return (
        <div className="basketRealProductVisual">
          <ProductVisual p={product} />
        </div>
      );
    }
  }

  /*
   * Smart / handcrafted cards:
   * show the customer's memory photo where available.
   */
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="basketCustomerImage"
      />
    );
  }

  /*
   * Fallback
   */
  return (
    <div className="basketImagePlaceholder">
      <span>♥</span>
      <small>SMART MEMORIES</small>
    </div>
  );
}