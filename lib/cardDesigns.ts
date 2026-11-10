export const snowflakeCardSlug = 'card-christmas-snowflake';

export const cardDesigns = [
  { name: 'Floral Keepsake', photoSlug: 'card-floral-keepsake', style: 'floral', mark: '✿', description: 'Soft flowers and elegant handmade detailing.' },
  { name: 'Classic Elegance', photoSlug: 'card-classic-elegance', style: 'classic', mark: 'SM', description: 'Traditional, timeless and beautifully understated.' },
  { name: 'Modern Minimal', photoSlug: 'card-modern-minimal', style: 'minimal', mark: '— ♥ —', description: 'Clean typography, modern layout and a personal touch.' },
  { name: 'Photo Feature', photoSlug: 'card-photo-feature', style: 'photo', mark: 'YOUR PHOTO', description: 'Make a favourite picture the centre of the card.' },
] as const;

export type CatalogueCard = {
  photoSlug: string;
  name: string;
  description: string;
  mark: string;
  basePricePence: number;
};

export const defaultCatalogueCards: CatalogueCard[] = cardDesigns.map((card) => ({
  ...card,
  basePricePence: 695,
}));

export function cardPhotoSlugs(slug: string) {
  return [slug, `${slug}-angle-2`, `${slug}-angle-3`, `${slug}-angle-4`];
}

export type SavedCardPreview = {
  greeting: string;
  colour?: string;
  printedPhoto: boolean;
};

export const cardOccasionWording = {
  Birthday: ['Happy Birthday', 'Wishing you a very special day filled with wonderful memories.'],
  Anniversary: ['Happy Anniversary', 'Here’s to all the memories you’ve made and all those still to come.'],
  Wedding: ['To a beautiful couple', 'Wishing you a lifetime of love and happiness together.'],
  Congratulations: ['Congratulations!', 'You worked so hard for this. I’m so happy for you!'],
  'Thank You': ['Thank you', 'Your kindness meant more to me than you know.'],
  'New Baby': ['Hello little one', 'Sending so much love to you and your growing family.'],
  "Mother's Day": ['Happy Mother’s Day', 'Thank you for all the little things you do that mean so much.'],
  "Father's Day": ['Happy Father’s Day', 'Thank you for always being there for me.'],
  'Sympathy / Thinking of You': ['Thinking of you', 'Sending you love and thinking of you in the days ahead.'],
  'Just Because': ['Especially for you', 'Just a little reminder of how much you mean to me.'],
  'Other / Custom': ['', ''],
  Christmas: ['Merry Christmas', 'Wishing you a Christmas full of warmth and happiness.'],
  "Valentine's": ['For my love', 'I’m so glad I get to share these memories with you.'],
  Graduation: ['You did it!', 'I’m so proud of you and excited for what comes next.'],
  Retirement: ['A new chapter', 'Wishing you time for all the things you love.'],
  Remembrance: ['Always remembered', 'Holding you and your memories close today.'],
} as const;

export function getCardWording(occasion: string): readonly [string, string] {
  return Object.hasOwn(cardOccasionWording, occasion)
    ? cardOccasionWording[occasion as keyof typeof cardOccasionWording]
    : cardOccasionWording['Just Because'];
}
