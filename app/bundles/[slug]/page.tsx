import Link from 'next/link';
import DeliverySummary from '@/components/DeliverySummary';
import {
  notFound,
} from 'next/navigation';

import {
  getBundle,
  money,
} from '../../../lib/bundles';

export default async function BundleDetailPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } =
    await params;

  const bundle =
    getBundle(slug);

  if (!bundle) {
    notFound();
  }

  return (
    <section className="wrap">
      <span className="eyebrow">
        SPECIAL BUNDLE
      </span>

      <h1>
        {bundle.name}
      </h1>

      <p className="lead">
        {bundle.description}
      </p>

      <div
        className="card"
        style={{
          maxWidth: '560px',
          marginBottom: '32px',
        }}
      >
        <p
          style={{
            fontSize: '2rem',
            fontWeight: 800,
          }}
        >
          Bundle total {money(
            bundle.bundlePrice
          )}
        </p>

      </div>

      <h2>
        Included in your bundle
      </h2>

      <div className="products">
        {bundle.products.map(
          (product) => (
            <article
              className="card"
              key={
                product.slug
              }
            >
              <span className="eyebrow">
                INCLUDED
              </span>

              <h3>
                {product.name}
              </h3>

              <p>
                Choose this item’s template in the bundle editor where options are available.
              </p>
            </article>
          )
        )}
      </div>

      <DeliverySummary />

      <div
        style={{
          marginTop: '34px',
        }}
      >
        <Link
          href={`/bundles/${bundle.slug}/personalise`}
          className="btn big"
        >
          Personalise Complete Bundle
        </Link>
      </div>

      <p
        style={{
          marginTop: '26px',
        }}
      >
        Your photo, printed wording and digital Smart Memory are shared across the bundle. You can preview each item and choose its template separately.
      </p>

      <p
        style={{
          marginTop: '30px',
        }}
      >
        <Link href="/bundles">
          ← Back to bundles
        </Link>
      </p>
    </section>
  );
}
