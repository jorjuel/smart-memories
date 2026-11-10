import {isGiftStudioProduct} from '@/lib/giftStudioProducts';
import SlateSinglePageCustomiser from '../../../components/SlateSinglePageCustomiser';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadGiftPrices } from '@/lib/cardCatalogueServer';

import {
  products,
  money,
} from '../../../lib/products';

import ProductVisual from '../../../components/ProductVisual';
import DeliverySummary from '../../../components/DeliverySummary';

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    occasion?: string;
  }>;
}) {
  const { slug } = await params;
  const { occasion } = await searchParams;

  const product = products.find(
    (item) => item.slug === slug
  );

  if (!product) {
    notFound();
  }

  if (isGiftStudioProduct(slug)) return <SlateSinglePageCustomiser productSlug={slug} initialOccasion={occasion} />;

  const prices = await loadGiftPrices().catch(() => ({} as Record<string, number>));
  const price = (prices[slug] ?? Math.round(product.price * 100)) / 100;

  const personaliseHref = occasion
    ? `/personalise/${product.slug}?occasion=${encodeURIComponent(
        occasion
      )}`
    : `/personalise/${product.slug}`;

  return (
    <section className="wrap productDetail">
      <ProductVisual
        p={product}
        detail
      />

      <div>
        <span className="eyebrow">
          {product.category}
        </span>

        <h1>
          {product.name}
        </h1>

        <h2>
          {money(price)}
        </h2>

        {occasion && (
          <p>
            Occasion: <strong>{occasion}</strong>
          </p>
        )}

        <p className="lead">
          {product.description}
        </p>

        <div className="featureList">
          <p>
            ✓ Add your own photograph or design
          </p>

          <p>
            ✓ Personalise the wording
          </p>

          <p>
            ✓ See a finished-product preview
          </p>

          <p>
            ✓ Record a personal voice memory
          </p>

          <p>
            ✓ Hidden NFC Smart Memory
          </p>

          <p>
            ✓ QR backup
          </p>
        </div>

        <Link
          className="btn big"
          href={personaliseHref}
        >
          Personalise this gift →
        </Link>
        <DeliverySummary />
      </div>
    </section>
  );
}
