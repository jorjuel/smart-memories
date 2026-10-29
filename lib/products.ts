export type Product = {
  slug: string;
  name: string;
  price: number;
  category: string;
  description: string;
  emoji: string;
};

export const products: Product[] = [
  {
    slug: 'smart-photo-slate',
    name: 'Personalised Photo Slate',
    price: 24.99,
    category: 'Smart Memories',
    description:
      'Create a personalised slate with your photograph, wording and hidden Smart Memory.',
    emoji: '🖼️',
  },

  {
    slug: 'smart-memory-plaque',
    name: 'Personalised Aluminium Plaque',
    price: 29.99,
    category: 'Smart Memories',
    description:
      'A modern aluminium photo plaque personalised with your image, wording and Smart Memory.',
    emoji: '✨',
  },

  {
    slug: 'photo-mug',
    name: 'Personalised Mug',
    price: 12.99,
    category: 'Home & Gifts',
    description:
      'Use one of our designs or upload your own artwork to create a personalised mug.',
    emoji: '☕',
  },

  {
    slug: 'coaster-set',
    name: 'Personalised Coasters',
    price: 14.99,
    category: 'Home & Gifts',
    description:
      'Choose a single coaster or a personalised set using your photograph or design.',
    emoji: '◼️',
  },

  {
    slug: 'keyring',
    name: 'Personalised Keyring',
    price: 8.99,
    category: 'Keepsakes',
    description:
      'A personalised keyring carrying your favourite photograph and Smart Memory.',
    emoji: '🔑',
  },

  {
    slug: 'mouse-mat',
    name: 'Personalised Mouse Mat',
    price: 14.99,
    category: 'Desk & Office',
    description:
      'Turn a favourite photograph or design into a personalised mouse mat.',
    emoji: '🖱️',
  },

  {
    slug: 'white-t-shirt',
    name: 'Personalised White T-Shirt',
    price: 19.99,
    category: 'Clothing',
    description:
      'Create a white personalised T-shirt with your own photograph, wording or design.',
    emoji: '👕',
  },
];

export const money = (
  value: number
) => `£${value.toFixed(2)}`;