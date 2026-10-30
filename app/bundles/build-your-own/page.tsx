'use client';

import {
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

const products = [
  {
    name: 'Personalised Photo Slate',
    slug: 'smart-photo-slate',
    price: 24.99,
  },
  {
    name: 'Personalised Aluminium Plaque',
    slug: 'smart-memory-plaque',
    price: 29.99,
  },
  {
    name: 'Personalised Mug',
    slug: 'photo-mug',
    price: 12.99,
  },
  {
    name: 'Personalised Coasters',
    slug: 'coaster-set',
    price: 14.99,
  },
  {
    name: 'Personalised Keyring',
    slug: 'keyring',
    price: 8.99,
  },
  {
    name: 'Personalised Mouse Mat',
    slug: 'mouse-mat',
    price: 14.99,
  },
  {
    name: 'Personalised White T-Shirt',
    slug: 'white-t-shirt',
    price: 19.99,
  },
];

function money(value: number) {
  return `£${value.toFixed(2)}`;
}

function getDiscountRate(
  count: number
) {
  if (count >= 4) {
    return 0.15;
  }

  if (count === 3) {
    return 0.1;
  }

  if (count === 2) {
    return 0.05;
  }

  return 0;
}

export default function BuildYourOwnBundlePage() {
  const [
    selected,
    setSelected,
  ] = useState<string[]>([]);

  function toggleProduct(
    slug: string
  ) {
    setSelected(
      (current) =>
        current.includes(
          slug
        )
          ? current.filter(
              (item) =>
                item !==
                slug
            )
          : [
              ...current,
              slug,
            ]
    );
  }

  const selectedProducts =
    useMemo(
      () =>
        products.filter(
          (product) =>
            selected.includes(
              product.slug
            )
        ),
      [selected]
    );

  const normalTotal =
    useMemo(
      () =>
        selectedProducts.reduce(
          (
            total,
            product
          ) =>
            total +
            product.price,
          0
        ),
      [
        selectedProducts,
      ]
    );

  const discountRate =
    getDiscountRate(
      selectedProducts.length
    );

  const saving =
    normalTotal *
    discountRate;

  const bundleTotal =
    normalTotal -
    saving;

  return (
    <section className="wrap">
      <span className="eyebrow">
        BUILD YOUR OWN BUNDLE
      </span>

      <h1>
        Create your own personalised collection
      </h1>

      <p className="lead">
        Choose two or more products and your bundle discount will be applied automatically.
      </p>

      <div
        className="card"
        style={{
          marginBottom: '32px',
        }}
      >
        <h2>
          Bundle discounts
        </h2>

        <p>
          2 products → 5% off
        </p>

        <p>
          3 products → 10% off
        </p>

        <p>
          4 or more products → 15% off
        </p>
      </div>

      <div className="products">
        {products.map(
          (product) => {
            const isSelected =
              selected.includes(
                product.slug
              );

            return (
              <article
                className="card"
                key={
                  product.slug
                }
              >
                <span className="eyebrow">
                  PRODUCT
                </span>

                <h2>
                  {product.name}
                </h2>

                <p
                  style={{
                    fontSize:
                      '1.25rem',
                    fontWeight: 800,
                  }}
                >
                  {money(
                    product.price
                  )}
                </p>

                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    toggleProduct(
                      product.slug
                    )
                  }
                >
                  {isSelected
                    ? '✓ Selected'
                    : 'Add to bundle'}
                </button>

                {isSelected && (
                  <p
                    style={{
                      marginTop:
                        '12px',
                    }}
                  >
                    <Link
                      href={`/shop/${product.slug}`}
                    >
                      Personalise this item →
                    </Link>
                  </p>
                )}
              </article>
            );
          }
        )}
      </div>

      <div
        className="card"
        style={{
          marginTop: '36px',
          maxWidth: '560px',
        }}
      >
        <span className="eyebrow">
          YOUR BUNDLE
        </span>

        <h2>
          {selectedProducts.length}{' '}
          product
          {selectedProducts.length ===
          1
            ? ''
            : 's'}{' '}
          selected
        </h2>

        {selectedProducts.length ===
        0 ? (
          <p>
            Choose at least two products to create a bundle.
          </p>
        ) : (
          <>
            {selectedProducts.map(
              (
                product
              ) => (
                <p
                  key={
                    product.slug
                  }
                >
                  ✓{' '}
                  {
                    product.name
                  }{' '}
                  —{' '}
                  {money(
                    product.price
                  )}
                </p>
              )
            )}

            <hr
              style={{
                margin:
                  '20px 0',
              }}
            />

            <p>
              Normal total:{' '}
              <strong>
                {money(
                  normalTotal
                )}
              </strong>
            </p>

            <p>
              Bundle discount:{' '}
              <strong>
                {Math.round(
                  discountRate *
                    100
                )}
                %
              </strong>
            </p>

            <p>
              You save:{' '}
              <strong>
                {money(
                  saving
                )}
              </strong>
            </p>

            <p
              style={{
                fontSize:
                  '1.8rem',
                fontWeight: 800,
              }}
            >
              Bundle total:{' '}
              {money(
                bundleTotal
              )}
            </p>

            {selectedProducts.length <
            2 ? (
              <p>
                Add one more product to unlock your first bundle discount.
              </p>
            ) : (
              <div
                style={{
                  marginTop:
                    '20px',
                }}
              >
                <p>
                  ✓ Your bundle discount is active.
                </p>

                <p>
                  Personalise each selected item, then return here to complete your bundle.
                </p>
              </div>
            )}
          </>
        )}
      </div>

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