import Link from 'next/link';
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

  const saving =
    bundle.normalPrice -
    bundle.bundlePrice;

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
            textDecoration:
              'line-through',
            opacity: 0.6,
          }}
        >
          Normally{' '}
          {money(
            bundle.normalPrice
          )}
        </p>

        <p
          style={{
            fontSize: '2rem',
            fontWeight: 800,
          }}
        >
          {money(
            bundle.bundlePrice
          )}
        </p>

        <p
          style={{
            fontWeight: 700,
          }}
        >
          Save{' '}
          {money(saving)}
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
                Uses the same shared photo, wording and Smart Memory.
              </p>
            </article>
          )
        )}
      </div>

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
        One photo, one message and one voice recording will be used across all items.
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