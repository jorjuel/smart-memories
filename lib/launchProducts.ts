import {products} from './products';

// Temporary public catalogue for the initial Smart Memories launch.
// Keep historical product definitions for existing orders and memories.
export const launchProductSlugs = [
  'smart-photo-slate',
  'coaster-set',
  'photo-mug',
  'keyring',
  'mouse-mat',
] as const;

const launchSet: ReadonlySet<string> = new Set(launchProductSlugs);

export function isLaunchProduct(slug:string):boolean {
  return launchSet.has(slug);
}

export const launchProducts = launchProductSlugs
  .map(slug => products.find(product => product.slug === slug))
  .filter((product):product is (typeof products)[number] => Boolean(product));
