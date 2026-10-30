export type BundleProduct = {
  name: string;
  slug: string;
};

export type Bundle = {
  slug: string;
  name: string;
  description: string;
  normalPrice: number;
  bundlePrice: number;
  occasion: string;
  products: BundleProduct[];
};

export const bundles: Bundle[] = [
  {
    slug: 'birthday-bundle',
    name: 'Birthday Bundle',
    description:
      'A personalised birthday collection with a mug, coasters and keyring.',
    normalPrice: 36.97,
    bundlePrice: 32.99,
    occasion: 'Birthday',
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

  {
    slug: 'home-bundle',
    name: 'Home Bundle',
    description:
      'A personalised collection for home, study or office.',
    normalPrice: 42.97,
    bundlePrice: 37.99,
    occasion: 'Just Because',
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

  {
    slug: 'memory-bundle',
    name: 'Memory Bundle',
    description:
      'A keepsake collection built around one favourite memory.',
    normalPrice: 46.97,
    bundlePrice: 41.99,
    occasion: 'Family Memory',
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

  {
    slug: 'pet-memory-bundle',
    name: 'Pet Memory Bundle',
    description:
      'A personalised collection for celebrating a much-loved pet.',
    normalPrice: 47.97,
    bundlePrice: 42.99,
    occasion: 'Pet Memory',
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

  {
    slug: 'work-teacher-bundle',
    name: 'Work & Teacher Bundle',
    description:
      'A personalised thank-you collection for teachers and colleagues.',
    normalPrice: 36.97,
    bundlePrice: 32.99,
    occasion: 'Teacher Gift',
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
];

export function getBundle(
  slug: string
) {
  return bundles.find(
    (bundle) =>
      bundle.slug === slug
  );
}

export function money(
  value: number
) {
  return `£${value.toFixed(2)}`;
}