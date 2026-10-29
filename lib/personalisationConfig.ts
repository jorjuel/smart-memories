export type Orientation =
  | 'portrait'
  | 'landscape'
  | 'square';

export type TextLayout =
  | 'photo-only'
  | 'top'
  | 'bottom'
  | 'top-bottom'
  | 'paragraph';

export type PersonalisationProduct = {
  slug: string;
  name: string;

  sizes?: string[];

  orientations?: Orientation[];

  textLayouts?: TextLayout[];

  occasions: string[];

  templates: string[];

  accessories?: string[];

  colours?: string[];

  printPositions?: string[];

  allowMultiplePhotos?: boolean;

  maxPhotos?: number;

  smartMemory: boolean;
};

export const commonOccasions = [
  'Birthday',
  'Wedding',
  'Anniversary',
  'Engagement',
  'New Baby',
  'Graduation',
  'Retirement',
  'Leaving Gift',
  'Teacher Gift',
  'Pet Memory',
  'Family Memory',
  'Memorial',
  'Christmas',
  'Mother’s Day',
  'Father’s Day',
  'Valentine’s Day',
  'Thank You',
  'Congratulations',
  'Party',
  'Travel Memory',
  'Just Because',
  'Other',
];

export const personalisationProducts: PersonalisationProduct[] =
  [
    {
      slug: 'smart-photo-slate',

      name: 'Personalised Slate',

      sizes: [
        'Small',
        'Medium',
        'Large',
      ],

      orientations: [
        'portrait',
        'landscape',
      ],

      textLayouts: [
        'photo-only',
        'top',
        'bottom',
        'top-bottom',
        'paragraph',
      ],

      occasions: commonOccasions,

      templates: [
        'Minimal Photo',
        'Birthday Celebration',
        'Wedding Classic',
        'Anniversary Romance',
        'Family Memory',
        'Pet Memory',
        'Memorial Tribute',
        'Retirement & Leaving',
        'Elegant Border',
        'Modern Frame',
        'Floral Keepsake',
        'Top & Bottom Message',
      ],

      accessories: [
        'No stand',
        'Add stand',
      ],

      allowMultiplePhotos: true,

      maxPhotos: 4,

      smartMemory: true,
    },

    {
      slug: 'smart-memory-plaque',

      name: 'Personalised Aluminium Plaque',

      sizes: [
        'Small',
        'Medium',
        'Large',
      ],

      orientations: [
        'portrait',
        'landscape',
      ],

      textLayouts: [
        'photo-only',
        'top',
        'bottom',
        'top-bottom',
        'paragraph',
      ],

      occasions: commonOccasions,

      templates: [
        'Clean Modern',
        'Elegant Border',
        'Birthday',
        'Wedding',
        'Family',
        'Pet',
        'Memorial',
        'Retirement',
      ],

      smartMemory: true,
    },

   
{
  slug: 'photo-mug',

  name: 'Personalised Mug',

  sizes: [
    'Standard Mug',
  ],

  textLayouts: [
    'photo-only',
    'top',
    'bottom',
    'top-bottom',
  ],

  occasions: commonOccasions,

  templates: [
    'Photo Classic',
    'Birthday Celebration',
    'Best Teacher',
    'Wedding',
    'Anniversary',
    'Pet Memory',
    'Family',
    'Funny Message',
    'Christmas',
    'Minimal Name',
  ],

  allowMultiplePhotos: false,

  maxPhotos: 1,

  smartMemory: true,
},
    {
      slug: 'mouse-mat',

      name: 'Personalised Mouse Mat',

      sizes: [
        'Standard',
      ],

      orientations: [
        'landscape',
      ],

      textLayouts: [
        'photo-only',
        'top',
        'bottom',
        'top-bottom',
      ],

      occasions: commonOccasions,

      templates: [
        'Full Photo',
        'Family',
        'Pet',
        'Teacher',
        'Work Desk',
        'Photo Collage',
      ],

      allowMultiplePhotos: true,

      maxPhotos: 4,

      smartMemory: true,
    },

   {
  slug: 'coaster-set',

  name: 'Personalised Coasters',

  sizes: [
    'Single',
    'Set of 2',
    'Set of 4',
    'Set of 6',
  ],

  textLayouts: [
    'photo-only',
    'top',
    'bottom',
    'top-bottom',
  ],

  occasions: commonOccasions,

  templates: [
    'Photo Classic',
    'Birthday',
    'Wedding',
    'Anniversary',
    'Family',
    'Pet',
    'Teacher Gift',
    'Christmas',
    'Minimal',
  ],

  allowMultiplePhotos: false,

  maxPhotos: 1,

  smartMemory: true,
},
    {
      slug: 'keyring',

      name: 'Personalised Keyring',

      sizes: [
        'Standard',
      ],

      orientations: [
        'portrait',
        'landscape',
      ],

      textLayouts: [
        'photo-only',
        'bottom',
      ],

      occasions: commonOccasions,

      templates: [
        'Photo Only',
        'Photo + Name',
        'Pet',
        'Couple',
        'Family',
        'Memorial',
      ],

      smartMemory: true,
    },

    {
      slug: 'white-t-shirt',

      name: 'Personalised White T-Shirt',

      sizes: [
        'Small',
        'Medium',
        'Large',
        'XL',
        'XXL',
      ],

      textLayouts: [
        'photo-only',
        'top',
        'bottom',
        'top-bottom',
      ],

      occasions: commonOccasions,

      templates: [
        'Photo Centre',
        'Birthday',
        'Party',
        'Family',
        'Memorial',
        'Team',
        'Leaving',
      ],

      printPositions: [
        'Centre Front',
        'Small Chest',
        'Full Front',
        'Back',
        'Front + Back',
      ],

      smartMemory: true,
    },

    {
      slug: 'handcrafted-card',

      name: 'Handcrafted Card',

      sizes: [
        'Standard',
        'Large',
      ],

      orientations: [
        'portrait',
        'landscape',
      ],

      textLayouts: [
        'photo-only',
        'top',
        'bottom',
        'top-bottom',
        'paragraph',
      ],

      occasions: commonOccasions,

      templates: [
        'Floral Keepsake',
        'Classic Elegance',
        'Rustic Handmade',
        'Modern Minimal',
        'Photo Feature',
        'Luxury Gold',
        'Watercolour',
        'Layered Paper',
        'Contemporary Type',
        'Signature Bespoke',
      ],

      colours: [
        'Classic',
        'Soft Pink',
        'Blue',
        'Green',
        'Gold',
        'Neutral',
      ],

      allowMultiplePhotos: true,

      maxPhotos: 4,

      smartMemory: true,
    },
  ];

export function getPersonalisationProduct(
  slug: string
) {
  return personalisationProducts.find(
    (product) =>
      product.slug === slug
  );
}