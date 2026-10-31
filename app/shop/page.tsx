import Image from 'next/image';
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
  'Just Because': products.map((product) => product.slug),
};

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

const bundles = [
  {
    slug: 'birthday-bundle',
    name: 'Birthday Bundle',
    description: 'Mug + Coasters + Keyring',
    normalPrice: 36.97,
    bundlePrice: 32.99,
  },
  {
    slug: 'home-bundle',
    name: 'Home Bundle',
    description: 'Mug + Coasters + Mouse Mat',
    normalPrice: 42.97,
    bundlePrice: 37.99,
  },
  {
    slug: 'memory-bundle',
    name: 'Memory Bundle',
    description: 'Slate + Keyring + Mug',
    normalPrice: 46.97,
    bundlePrice: 41.99,
  },
  {
    slug: 'pet-memory-bundle',
    name: 'Pet Memory Bundle',
    description: 'Slate + Keyring + Coasters',
    normalPrice: 47.97,
    bundlePrice: 42.99,
  },
  {
    slug: 'work-teacher-bundle',
    name: 'Work & Teacher Bundle',
    description: 'Mug + Mouse Mat + Keyring',
    normalPrice: 36.97,
    bundlePrice: 32.99,
  },
];

const corporateBundles = [
  {
    name: 'Employee Welcome Pack',
    description: 'Mug + Mouse Mat + Keyring',
  },
  {
    name: 'Thank You Pack',
    description: 'Mug + Coasters + Keyring',
  },
  {
    name: 'Event Gift Pack',
    description: 'Mug + Keyring + White T-Shirt',
  },
  {
    name: 'Premium Client Pack',
    description: 'Aluminium Plaque + Mug + Coasters',
  },
  {
    name: 'Recognition Pack',
    description: 'Photo Slate + Keyring + Mug',
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
  const { occasion } = await searchParams;

  const allowedProducts =
    occasion && occasionProducts[occasion]
      ? occasionProducts[occasion]
      : null;

  const filteredProducts = allowedProducts
    ? products.filter((product) =>
        allowedProducts.includes(product.slug)
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
          : 'Choose personalised gifts, save with a bundle or explore corporate gifting.'}
      </p>

      {occasion && (
        <div style={{ marginBottom: '28px' }}>
          <Link href="/shop">
            ← View full shop
          </Link>

          {' · '}

          <Link href="/occasions">
            Choose another occasion
          </Link>
        </div>
      )}

      <div className="shopAccordion">

        {/* ==========================================
            PERSONALISED GIFTS
            ========================================== */}

        <details
          className="shopAccordionItem"
          open
        >
          <summary className="shopAccordionSummary">
            <div className="shopAccordionText">
              <span className="eyebrow">
                PERSONALISED GIFTS
              </span>

              <h2>
                Shop your way
              </h2>

              <p>
                Browse individual products or start with the occasion.
              </p>
            </div>

            <div className="shopAccordionVisual">
              <Image
                src="/shop-sections/individual-gifts.png"
                alt="Personalised Smart Memories gifts"
                fill
                sizes="220px"
              />
            </div>

            <span className="shopAccordionArrow">
              +
            </span>
          </summary>

          <div className="shopAccordionContent">

            {!occasion && (
              <>
                <div
                  style={{
                    marginBottom: '22px',
                  }}
                >
                  <span className="eyebrow">
                    SHOP BY OCCASION
                  </span>

                  <h2>
                    What are you celebrating?
                  </h2>

                  <p>
                    Choose an occasion and we’ll narrow down the most suitable gifts.
                  </p>
                </div>

                <div className="occasionQuickGrid">
                  {occasions.map((item) => (
                    <Link
                      key={item}
                      href={`/shop?occasion=${encodeURIComponent(
                        item
                      )}`}
                      className="occasionQuickCard"
                    >
                      {item}
                    </Link>
                  ))}
                </div>

                <hr
                  style={{
                    margin: '34px 0',
                  }}
                />
              </>
            )}

            <div
              style={{
                marginBottom: '22px',
              }}
            >
              <span className="eyebrow">
                {occasion
                  ? 'RECOMMENDED PRODUCTS'
                  : 'SHOP BY PRODUCT'}
              </span>

              <h2>
                {occasion
                  ? `Best gifts for ${occasion}`
                  : 'Choose your gift'}
              </h2>

              <p>
                Personalise the product with your photo, wording and Smart Memory.
              </p>
            </div>

            <div className="products">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.slug}
                  p={product}
                  occasion={occasion}
                />
              ))}
            </div>
          </div>
        </details>

        {/* ==========================================
            SPECIAL BUNDLES
            ========================================== */}

        {!occasion && (
          <details className="shopAccordionItem">
            <summary className="shopAccordionSummary">
              <div className="shopAccordionText">
                <span className="eyebrow">
                  SPECIAL BUNDLES
                </span>

                <h2>
                  More gifts, better value
                </h2>

                <p>
                  Ready-made personalised collections at a discounted price.
                </p>
              </div>

              <div className="shopAccordionVisual">
                <Image
                  src="/shop-sections/special-bundles.png"
                  alt="Personalised Smart Memories bundles"
                  fill
                  sizes="220px"
                />
              </div>

              <span className="shopAccordionArrow">
                +
              </span>
            </summary>

            <div className="shopAccordionContent">
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
                          textDecoration: 'line-through',
                          opacity: 0.6,
                        }}
                      >
                        Normally {money(bundle.normalPrice)}
                      </p>

                      <p
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 800,
                          marginBottom: '4px',
                        }}
                      >
                        {money(bundle.bundlePrice)}
                      </p>

                      <p style={{ fontWeight: 700 }}>
                        Save {money(saving)}
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
                    Mix and match products and unlock a bundle discount.
                  </p>

                  <Link
                    href="/bundles/build-your-own"
                    className="btn small"
                  >
                    Build my bundle →
                  </Link>
                </article>
              </div>
            </div>
          </details>
        )}

        {/* ==========================================
            CORPORATE BUNDLES
            ========================================== */}

        {!occasion && (
          <details className="shopAccordionItem">
            <summary className="shopAccordionSummary">
              <div className="shopAccordionText">
                <span className="eyebrow">
                  CORPORATE BUNDLES
                </span>

                <h2>
                  Gifts for teams, clients and events
                </h2>

                <p>
                  Branded gift packs for businesses, staff and customers.
                </p>
              </div>

              <div className="shopAccordionVisual">
                <Image
                  src="/shop-sections/corporate-bundles.png"
                  alt="Corporate Smart Memories gift collection"
                  fill
                  sizes="220px"
                />
              </div>

              <span className="shopAccordionArrow">
                +
              </span>
            </summary>

            <div className="shopAccordionContent">
              <div className="products">
                {corporateBundles.map((bundle) => {
                  const quoteUrl =
                    `/contact?type=corporate&bundle=${encodeURIComponent(
                      bundle.name
                    )}`;

                  return (
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
                        href={quoteUrl}
                        className="btn small"
                      >
                        Request a quote →
                      </Link>
                    </article>
                  );
                })}
              </div>
            </div>
          </details>
        )}
      </div>
    </section>
  );
}