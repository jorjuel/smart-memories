import Link from 'next/link';

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
  memoryFirst = false,
}: {
  p: Product;
  occasion?: string;
  memoryFirst?: boolean;
}) {
  const experience =
    getProductExperience(
      p.slug
    );

  const href = memoryFirst
    ? `/create?product=${encodeURIComponent(p.slug)}`
    : occasion
      ? `/shop/${p.slug}?occasion=${encodeURIComponent(occasion)}`
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
            p.price
          )}
        </b>

        <Link
          className="btn small"
          href={href}
        >
          {memoryFirst ? 'Create Memory & Add Gift' : 'Explore Smart Gift'}
        </Link>
      </div>
    </article>
  );
}