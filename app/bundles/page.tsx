import Link from 'next/link';

const bundles = [
  {
    title: 'Birthday Bundle',
    items: 'Mug + Coaster + Keyring',
    description:
      'A simple personalised gift set for birthdays and celebrations.',
  },
  {
    title: 'Home Bundle',
    items: 'Mug + Coaster Set + Mouse Mat',
    description:
      'A practical personalised collection for home or office.',
  },
  {
    title: 'Memory Bundle',
    items: 'Slate + Keyring + Mug',
    description:
      'A keepsake collection built around a favourite photo and memory.',
  },
  {
    title: 'Pet Memory Bundle',
    items: 'Slate + Keyring + Coaster',
    description:
      'A thoughtful collection for celebrating a much-loved pet.',
  },
  {
    title: 'Work & Teacher Bundle',
    items: 'Mug + Mouse Mat + Keyring',
    description:
      'A personalised thank-you set for teachers, colleagues and teams.',
  },
];

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
        Choose a ready-made bundle or build your own
        collection from Smart Memories products.
      </p>

      <div className="products">
        {bundles.map((bundle) => (
          <article
            key={bundle.title}
            className="card"
          >
            <span className="eyebrow">
              GIFT COLLECTION
            </span>

            <h2>{bundle.title}</h2>

            <p>
              <strong>{bundle.items}</strong>
            </p>

            <p>
              {bundle.description}
            </p>

            <Link
              href="/shop"
              className="btn"
            >
              Choose this bundle →
            </Link>
          </article>
        ))}

        <article className="card">
          <span className="eyebrow">
            YOUR CHOICE
          </span>

          <h2>
            Build Your Own Bundle
          </h2>

          <p>
            Mix and match products to create your own
            personalised collection.
          </p>

          <Link
            href="/shop"
            className="btn"
          >
            Build my bundle →
          </Link>
        </article>
      </div>
    </section>
  );
}
