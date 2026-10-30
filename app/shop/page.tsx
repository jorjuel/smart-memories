import Link from 'next/link';
import ProductCard from '../../components/ProductCard';
import { products } from '../../lib/products';

const occasionProducts: Record<string, string[]> = {
  Birthday: [
    'photo-mug',
    'smart-photo-slate',
    'coaster-set',
    'keyring',
    'white-t-shirt',
  ],

  Wedding: [
    'smart-photo-slate',
    'smart-memory-plaque',
    'photo-mug',
    'coaster-set',
    'keyring',
  ],

  Anniversary: [
    'smart-photo-slate',
    'smart-memory-plaque',
    'photo-mug',
    'keyring',
  ],

  Retirement: [
    'photo-mug',
    'smart-photo-slate',
    'mouse-mat',
    'keyring',
  ],

  'Leaving Gift': [
    'photo-mug',
    'mouse-mat',
    'smart-photo-slate',
    'keyring',
  ],

  'Teacher Gift': [
    'photo-mug',
    'mouse-mat',
    'coaster-set',
    'keyring',
  ],

  'Pet Memory': [
    'smart-photo-slate',
    'keyring',
    'photo-mug',
    'coaster-set',
    'mouse-mat',
  ],

  'Family Memory': [
    'smart-photo-slate',
    'photo-mug',
    'coaster-set',
    'smart-memory-plaque',
  ],

  'New Baby': [
    'smart-photo-slate',
    'photo-mug',
    'smart-memory-plaque',
    'keyring',
  ],

  Graduation: [
    'photo-mug',
    'smart-photo-slate',
    'white-t-shirt',
    'keyring',
  ],

  Christmas: [
    'photo-mug',
    'coaster-set',
    'smart-photo-slate',
    'keyring',
  ],

  'Just Because': products.map(
    (product) => product.slug
  ),
};

const bundles = [
  {
    slug: 'birthday-bundle',
    name: 'Birthday Bundle',
    description:
      'Mug + Coasters + Keyring',
    normalPrice: 36.97,
    bundlePrice: 32.99,
  },
  {
    slug: 'home-bundle',
    name: 'Home Bundle',
    description:
      'Mug + Coasters + Mouse Mat',
    normalPrice: 42.97,
    bundlePrice: 37.99,
  },
  {
    slug: 'memory-bundle',
    name: 'Memory Bundle',
    description:
      'Slate + Keyring + Mug',
    normalPrice: 46.97,
    bundlePrice: 41.99,
  },
  {
    slug: 'pet-memory-bundle',
    name: 'Pet Memory Bundle',
    description:
      'Slate + Keyring + Coasters',
    normalPrice: 47.97,
    bundlePrice: 42.99,
  },
  {
    slug: 'work-teacher-bundle',
    name: 'Work & Teacher Bundle',
    description:
      'Mug + Mouse Mat + Keyring',
    normalPrice: 36.97,
    bundlePrice: 32.99,
  },
];

const occasions = [
  'Birthday',
  'Wedding',
  'Anniversary',
  'Retirement',
  'Leaving Gift',
  'Teacher Gift',
  'Pet Memory',
  'Family Memory',
  'New Baby',
  'Graduation',
  'Christmas',
  'Just Because',
];

const corporateBundles = [
  {
    name: 'Employee Welcome Pack',
    description:
      'Mug + Mouse Mat + Keyring',
  },
  {
    name: 'Thank You Pack',
    description:
      'Mug + Coasters + Keyring',
  },
  {
    name: 'Event Gift Pack',
    description:
      'Mug + Keyring + White T-Shirt',
  },
  {
    name: 'Premium Client Pack',
    description:
      'Aluminium Plaque + Mug + Coasters',
  },
  {
    name: 'Recognition Pack',
    description:
      'Photo Slate + Keyring + Mug',
  },
  {
    name: 'Custom Corporate Bundle',
    description:
      'Build a branded pack around your event, team or customers.',
  },
];

function money(value: number) {
  return `£${value.toFixed(2)}`;
}

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<{
    occasion?: string;
  }>;
}) {
  const { occasion } =
    await searchParams;

  const allowedProducts =
    occasion &&
    occasionProducts[occasion]
      ? occasionProducts[occasion]
      : null;

  const filteredProducts =
    allowedProducts
      ? products.filter((product) =>
          allowedProducts.includes(
            product.slug
          )
        )
      : products;

  return (
    <section className="wrap">
      <span className="eyebrow">
        SMART MEMORIES SHOP
      </span>

      <h1>
        {occasion
          ? `Gifts for ${occasion}`
          : 'Shop Smart Memories'}
      </h1>

      <p className="lead">
        {occasion
          ? `We’ve selected personalised gifts that work especially well for ${occasion}.`
          : 'Choose an individual personalised gift, save with a bundle, shop by occasion or explore corporate gift packs.'}
      </p>

      {occasion && (
        <p>
          <Link href="/shop">
            ← View the full shop
          </Link>
          {' · '}
          <Link href="/occasions">
            Choose another occasion
          </Link>
        </p>
      )}

      {/* ==========================================
          INDIVIDUAL GIFTS
          ========================================== */}

      <div
        style={{
          marginTop: '42px',
          marginBottom: '24px',
        }}
      >
        <span className="eyebrow">
          INDIVIDUAL GIFTS
        </span>

        <h2>
          Shop personalised gifts
        </h2>

        <p>
          Choose one product and create it your way.
        </p>
      </div>

      <div className="products">
        {filteredProducts.map(
          (product) => (
            <ProductCard
              key={product.slug}
              p={product}
              occasion={occasion}
            />
          )
        )}
      </div>

      {/* ==========================================
          SPECIAL BUNDLES
          ========================================== */}

      {!occasion && (
        <>
          <div
            style={{
              marginTop: '64px',
              marginBottom: '24px',
            }}
          >
            <span className="eyebrow">
              SPECIAL BUNDLES
            </span>

            <h2>
              More gifts, better value
            </h2>

            <p>
              Save compared with buying each item separately.
            </p>
          </div>

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

                  <h3>
                    {bundle.name}
                  </h3>

                  <p>
                    {bundle.description}
                  </p>

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
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      marginBottom: '4px',
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

                  <Link
                    href={`/bundles/${bundle.slug}`}
                    className="btn small"
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

              <h3>
                Create Your Own Bundle
              </h3>

              <p>
                Mix and match from our personalised product range.
              </p>

              <Link
                href="/bundles/build-your-own"
                className="btn small"
              >
                Build my bundle →
              </Link>
            </article>
          </div>
        </>
      )}

      {/* ==========================================
          SHOP BY OCCASION
          ========================================== */}

      {!occasion && (
        <>
          <div
            style={{
              marginTop: '64px',
              marginBottom: '24px',
            }}
          >
            <span className="eyebrow">
              SHOP BY OCCASION
            </span>

            <h2>
              What are you celebrating?
            </h2>

            <p>
              Start with the occasion and we’ll narrow down the most suitable gifts.
            </p>
          </div>

          <div className="products">
            {occasions.map(
              (item) => (
                <article
                  className="card"
                  key={item}
                >
                  <span className="eyebrow">
                    OCCASION
                  </span>

                  <h3>
                    {item}
                  </h3>

                  <p>
                    Explore personalised gifts chosen for {item}.
                  </p>

                  <Link
                    href={`/shop?occasion=${encodeURIComponent(
                      item
                    )}`}
                    className="btn small"
                  >
                    Explore gifts →
                  </Link>
                </article>
              )
            )}
          </div>
        </>
      )}

      {/* ==========================================
          CORPORATE BUNDLES
          ========================================== */}

      {!occasion && (
        <>
          <div
            style={{
              marginTop: '64px',
              marginBottom: '24px',
            }}
          >
            <span className="eyebrow">
              CORPORATE BUNDLES
            </span>

            <h2>
              Gifts for teams, clients and events
            </h2>

            <p>
              Branded and personalised packs for staff recognition, customer gifts and business events.
            </p>
          </div>

          <div className="products">
            {corporateBundles.map(
              (bundle) => (
                <article
                  className="card"
                  key={bundle.name}
                >
                  <span className="eyebrow">
                    CORPORATE
                  </span>

                  <h3>
                    {bundle.name}
                  </h3>

                  <p>
                    {bundle.description}
                  </p>

                  <p>
                    Pricing depends on quantity, branding and delivery requirements.
                  </p>

                  <Link
                    href="/contact"
                    className="btn small"
                  >
                    Request a quote →
                  </Link>
                </article>
              )
            )}
          </div>
        </>
      )}
    </section>
  );
}