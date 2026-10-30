import Link from 'next/link';
import {
  Product,
  money,
} from '../lib/products';
import ProductVisual from './ProductVisual';

export default function ProductCard({
  p,
  occasion,
}: {
  p: Product;
  occasion?: string;
}) {
  const href = occasion
    ? `/shop/${p.slug}?occasion=${encodeURIComponent(
        occasion
      )}`
    : `/shop/${p.slug}`;

  return (
    <article className="product card">
      <ProductVisual p={p} />

      <span className="eyebrow">
        {p.category}
      </span>

      <h3>{p.name}</h3>

      <p>{p.description}</p>

      <div className="productFoot">
        <b>{money(p.price)}</b>

        <Link
          className="btn small"
          href={href}
        >
          View gift
        </Link>
      </div>
    </article>
  );
}