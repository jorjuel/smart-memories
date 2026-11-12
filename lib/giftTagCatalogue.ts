import { availableMemoryTagDesigns, memoryTagDesigns } from './memoryTagDesigns';

export type GiftTagDesign = {
  id: string;
  name: string;
  image: string;
  collection: string;
  description?: string;
  archived?: boolean;
};

export function mergeGiftTags(saved: GiftTagDesign[], includeArchived: boolean) {
  const tags = new Map<string, GiftTagDesign>();
  const activeIds = new Set<string>(availableMemoryTagDesigns.map(tag => tag.id));
  for (const tag of memoryTagDesigns) tags.set(tag.id, { ...tag, archived: !activeIds.has(tag.id) });
  for (const tag of saved) tags.set(tag.id, tag);
  return [...tags.values()].filter(tag => includeArchived || !tag.archived);
}
