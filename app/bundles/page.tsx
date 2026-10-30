import Link from 'next/link';

const bundles = [
  {
    slug: 'birthday-bundle',
    title: 'Birthday Bundle',
    items: [
      'Personalised Mug',
      'Personalised Coaster',
      'Personalised Keyring',
    ],
    description:
      'A cheerful personalised collection for birthdays and special celebrations.',
  },
  {
    slug: 'home-bundle',
    title: 'Home Bundle',
    items: [
      'Personalised Mug',
      'Personalised Coaster Set',
      'Personalised Mouse Mat',
    ],
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
    description:
      'A keepsake collection built around a favourite photo and Smart Memory.',
  },
  {
    slug: 'pet-memory-bundle',
    title: 'Pet Memory Bundle',
    items: [
      'Personalised Photo Slate',
      'Personalised Keyring',
      'Personalised Coaster',
    ],
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
    description:
      'A personalised thank-you collection for teachers, colleagues and teams.',
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
        Choose a ready-made collection or build your own personalised bundle.
      </p>

      <div className="products">
        {bundles.map((bundle) => (
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
              {bundle.items.map((item) => (
                <p key={item}>
                  ✓ {item}
                </p>
              ))}
            </div>

            <Link
              href={`/bundles/${bundle.slug}`}
              className="btn"
            >
              View bundle →
            </Link>
          </article>
        ))}

        <article className="card">
          <span className="eyebrow">
            BUILD YOUR OWN
          </span>

          <h2>
            Create Your Own Bundle
          </h2>

          <p>
            Choose from the seven active Smart Memories products and build a collection your way.
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