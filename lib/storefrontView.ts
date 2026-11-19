import { headers } from 'next/headers';
import { isGiftTagsOnly, storefrontOwnerHeader } from './storefrontAvailability';

export async function showGiftTagsOnly() {
  return isGiftTagsOnly() && (await headers()).get(storefrontOwnerHeader) !== 'true';
}
