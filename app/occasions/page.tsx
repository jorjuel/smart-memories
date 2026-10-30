import Link from 'next/link';

const occasions = [
  {
    name: 'Birthday',
    products: 'Mug, Slate, Coasters, Keyring, T-Shirt',
  },
  {
    name: 'Wedding',
    products: 'Slate, Aluminium Plaque, Mug, Coasters, Keyring',
  },
  {
    name: 'Anniversary',
    products: 'Slate, Mug, Plaque, Keyring',
  },
  {
    name: 'Retirement',
    products: 'Mug, Slate, Mouse Mat, Keyring',
  },
  {
    name: 'Leaving Gift',
    products: 'Mug, Mouse Mat, Slate, Keyring',
  },
  {
    name: 'Teacher Gift',
    products: 'Mug, Mouse Mat, Coasters, Keyring',
  },
  {
    name: 'Pet Memory',
    products: 'Slate, Keyring, Mug, Coasters, Mouse Mat',
  },
  {
    name: 'Family Memory',
    products: 'Slate, Mug, Coasters, Plaque',
  },
  {
    name: 'New Baby',
    products: 'Slate, Mug, Plaque, Keyring',
  },
  {
    name: 'Graduation',
    products: 'Mug, Slate, T-Shirt, Keyring',
  },
  {
    name: 'Christmas',
    products: 'Mug, Coasters, Slate, Keyring',
  },
  {
    name: 'Just Because',
    products: 'Choose any personalised product',
  },
];

export default function OccasionsPage() {
  return (
    <section className="wrap">
      <span className="eyebrow">
        CELEBRATIONS & SOCIAL
      </span>

      <h1>
        What are you celebrating?
      </h1>

      <p className="lead">
        Choose an occasion and we’ll show you the most suitable personalised gifts.
      </p>

      <div className="products">
        {occasions.map((occasion) => (
          <article
            className="card"
            key={occasion.name}
          >
            <span className="eyebrow">
              OCCASION
            </span>

            <h2>{occasion.name}</h2>

            <p>{occasion.products}</p>

            <Link
              href={`/shop?occasion=${encodeURIComponent(
                occasion.name
              )}`}
              className="btn"
            >
              Explore gifts →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}