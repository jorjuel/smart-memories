'use client';

import Link from 'next/link';
import { useGiftPrice } from '../lib/useCataloguePhoto';

import {
  Product,
  money,
} from '../lib/products';

import {
  getProductExperience,
} from '../lib/productExperience';

import ProductVisual from './ProductVisual';

export default function ProductCard({
  p,
  occasion,
}: {
  p: Product;
  occasion?: string;
}) {
  const price = useGiftPrice(p.slug, p.price);
  const experience =
    getProductExperience(
      p.slug
    );

  const href =
    occasion
      ? `/shop/${p.slug}?occasion=${encodeURIComponent(
          occasion
        )}`
      : `/shop/${p.slug}`;

  return (
    <article className="product card">
      <ProductVisual
        p={p}
      />

      <span className="eyebrow">
        SMART MEMORY GIFT
      </span>

      <h3>
        {
          experience.marketingName
        }
      </h3>

      <p>
        {
          experience.cardCopy
        }
      </p>

      <div className="productFoot">
        <b>
          {money(
            price
          )}
        </b>

        <Link
          className="btn small"
          href={href}
        >
          Explore Smart Gift
        </Link>
      </div>
    </article>
  );
}
