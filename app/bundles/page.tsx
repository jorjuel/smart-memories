import Link from 'next/link';

const bundles = [
  {
    slug: 'birthday-bundle',
    title: 'Birthday Bundle',
    items: [
      'Personalised Mug',
      'Personalised Coasters',
      'Personalised Keyring',
    ],
    normalPrice: 36.97,
    bundlePrice: 32.99,
    description:
      'A cheerful personalised collection for birthdays and special celebrations.',
  },

  {
    slug: 'home-bundle',
    title: 'Home Bundle',
    items: [
      'Personalised Mug',
      'Personalised Coasters',
      'Personalised Mouse Mat',
    ],
    normalPrice: 42.97,
    bundlePrice: 37.99,
    description:
      'A practical personalised collection for home, study or office.',
  },

  {
    slug: 'memory-bundle',
    title: 'Memory Bundle',
    items: [
      'Personalised Photo Slate',
      'Personalised Keyring',
      'Personalised Mug',
    ],
    normalPrice: 46.97,
    bundlePrice: 41.99,
    description:
      'A keepsake collection built around a favourite photo and Smart Memory.',
  },

  {
    slug: 'pet-memory-bundle',
    title: 'Pet Memory Bundle',
    items: [
      'Personalised Photo Slate',
      'Personalised Keyring',
      'Personalised Coasters',
    ],
    normalPrice: 47.97,
    bundlePrice: 42.99,
    description:
      'A thoughtful collection for celebrating a much-loved pet.',
  },

  {
    slug: 'work-teacher-bundle',
    title: 'Work & Teacher Bundle',
    items: [
      'Personalised Mug',
      'Personalised Mouse Mat',
      'Personalised Keyring',
    ],
    normalPrice: 36.97,
    bundlePrice: 32.99,
    description:
      'A personalised thank-you collection for teachers, colleagues and teams.',
  },
];

function money(value: number) {
  return `£${value.toFixed(2)}`;
}

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
        Choose a ready-made collection and save compared with buying the products separately.
      </p>

      <div className="products">
        {bundles.map((bundle) => {
          const saving =
            bundle.normalPrice -
            bundle.bundlePrice;

          return (
            <article
              className="card"
              key={bundle.slug}
            >
              <span className="eyebrow">
                GIFT COLLECTION
              </span>

              <h2>
                {bundle.title}
              </h2>

              <p>
                {bundle.description}
              </p>

              <div>
                {bundle.items.map(
                  (item) => (
                    <p key={item}>
                      ✓ {item}
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
                    textDecoration:
                      'line-through',
                    opacity: 0.6,
                    fontSize: '1rem',
                  }}
                >
                  Normally{' '}
                  {money(
                    bundle.normalPrice
                  )}
                </div>

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

                <div
                  style={{
                    fontWeight: 700,
                  }}
                >
                  Save{' '}
                  {money(saving)}
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