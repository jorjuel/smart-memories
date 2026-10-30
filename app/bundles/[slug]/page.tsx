import Link from 'next/link';
import { notFound } from 'next/navigation';

const bundleData: Record<
  string,
  {
    title: string;
    description: string;
    products: {
      name: string;
      slug: string;
    }[];
  }
> = {
  'birthday-bundle': {
    title: 'Birthday Bundle',
    description:
      'A personalised birthday collection with three practical gifts.',
    products: [
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
    ],
  },

  'home-bundle': {
    title: 'Home Bundle',
    description:
      'A personalised collection designed for home, desk or office use.',
    products: [
      {
        name: 'Personalised Mug',
        slug: 'photo-mug',
      },
      {
        name: 'Personalised Coasters',
        slug: 'coaster-set',
      },
      {
        name: 'Personalised Mouse Mat',
        slug: 'mouse-mat',
      },
    ],
  },

  'memory-bundle': {
    title: 'Memory Bundle',
    description:
      'A keepsake collection for preserving a favourite photo and voice memory.',
    products: [
      {
        name: 'Personalised Photo Slate',
        slug: 'smart-photo-slate',
      },
      {
        name: 'Personalised Keyring',
        slug: 'keyring',
      },
      {
        name: 'Personalised Mug',
        slug: 'photo-mug',
      },
    ],
  },

  'pet-memory-bundle': {
    title: 'Pet Memory Bundle',
    description:
      'A personalised keepsake collection for a special pet memory.',
    products: [
      {
        name: 'Personalised Photo Slate',
        slug: 'smart-photo-slate',
      },
      {
        name: 'Personalised Keyring',
        slug: 'keyring',
      },
      {
        name: 'Personalised Coasters',
        slug: 'coaster-set',
      },
    ],
  },

  'work-teacher-bundle': {
    title: 'Work & Teacher Bundle',
    description:
      'A practical thank-you collection for teachers, colleagues and teams.',
    products: [
      {
        name: 'Personalised Mug',
        slug: 'photo-mug',
      },
      {
        name: 'Personalised Mouse Mat',
        slug: 'mouse-mat',
      },
      {
        name: 'Personalised Keyring',
        slug: 'keyring',
      },
    ],
  },
};

export default async function BundleDetailPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const bundle =
    bundleData[slug];

  if (!bundle) {
    notFound();
  }

  return (
    <section className="wrap">
      <span className="eyebrow">
        SPECIAL BUNDLE
      </span>

      <h1>
        {bundle.title}
      </h1>

      <p className="lead">
        {bundle.description}
      </p>

      <div className="products">
        {bundle.products.map((product) => (
          <article
            className="card"
            key={product.slug}
          >
            <span className="eyebrow">
              INCLUDED
            </span>

            <h2>
              {product.name}
            </h2>

            <p>
              Personalise this item individually before completing your bundle.
            </p>

            <Link
              href={`/shop/${product.slug}`}
              className="btn"
            >
              Personalise item →
            </Link>
          </article>
        ))}
      </div>

      <p style={{ marginTop: '30px' }}>
        <Link href="/bundles">
          ← Back to bundles
        </Link>
      </p>
    </section>
  );
}
