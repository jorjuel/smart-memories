import Link from 'next/link';

const products = [
  {
    name: 'Personalised Photo Slate',
    slug: 'smart-photo-slate',
  },
  {
    name: 'Personalised Aluminium Plaque',
    slug: 'smart-memory-plaque',
  },
  {
    name: 'Personalised Mug',
    slug: 'photo-mug',
  },
  {
    name: 'Personalised Coasters',
    slug: 'coaster-set',
  },
  {
    name: 'Personalised Keyring',
    slug: 'keyring',
  },
  {
    name: 'Personalised Mouse Mat',
    slug: 'mouse-mat',
  },
  {
    name: 'Personalised White T-Shirt',
    slug: 'white-t-shirt',
  },
];

export default function BuildYourOwnBundlePage() {
  return (
    <section className="wrap">
      <span className="eyebrow">
        BUILD YOUR OWN BUNDLE
      </span>

      <h1>
        Choose your personalised products
      </h1>

      <p className="lead">
        Select the products you would like to combine into your own Smart Memories gift collection.
      </p>

      <div className="products">
        {products.map((product) => (
          <article
            className="card"
            key={product.slug}
          >
            <span className="eyebrow">
              PRODUCT
            </span>

            <h2>
              {product.name}
            </h2>

            <p>
              Add this item to your personalised collection.
            </p>

            <Link
              href={`/shop/${product.slug}`}
              className="btn"
            >
              Personalise this item →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
