import Link from 'next/link';

import { bundles, money } from '@/lib/bundles';

export default function BundlesPage() {
  return (
    <section className="wrap">
      <span className="eyebrow">
        SPECIAL BUNDLES
      </span>

      <h1>
        Personalised gift collections
      </h1>

      <p className="lead">
        Choose a ready-made collection and personalise the included gifts together.
      </p>

      <div className="products">
        {bundles.map((bundle) => {
          return (
            <article
              className="card"
              key={bundle.slug}
            >
              <span className="eyebrow">
                GIFT COLLECTION
              </span>

              <h2>
                {bundle.name}
              </h2>

              <p>
                {bundle.description}
              </p>

              <div>
                {bundle.products.map(
                  (item) => (
                    <p key={item.slug}>
                      ✓ {item.name}
                    </p>
                  )
                )}
              </div>

              <div
                style={{
                  marginTop: '18px',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    fontSize: '1.7rem',
                    fontWeight: 800,
                  }}
                >
                  {money(
                    bundle.bundlePrice
                  )}
                </div>

              </div>

              <Link
                href={`/bundles/${bundle.slug}`}
                className="btn"
              >
                View bundle →
              </Link>
            </article>
          );
        })}

        <article className="card">
          <span className="eyebrow">
            BUILD YOUR OWN
          </span>

          <h2>
            Create Your Own Bundle
          </h2>

          <p>
            Choose from the seven active Smart Memories products and build your own personalised collection.
          </p>

          <p>
            Build-your-own discounts will be calculated based on how many products you select.
          </p>

          <Link
            href="/bundles/build-your-own"
            className="btn"
          >
            Build my bundle →
          </Link>
        </article>
      </div>
    </section>
  );
}
