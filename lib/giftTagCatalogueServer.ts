import { supabaseAdmin } from './supabaseAdmin';
import { mergeGiftTags, type GiftTagDesign } from './giftTagCatalogue';
import { writeCatalogueRecord } from './cardCatalogueServer';

export async function loadGiftTags(includeArchived = false) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    return mergeGiftTags([], includeArchived);
  }
  const bucket = supabaseAdmin().storage.from('card-catalogue');
  const records: GiftTagDesign[] = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await bucket.list('gift-tags', {
      limit: 100, offset, sortBy: { column: 'name', order: 'asc' },
    });
    if (error && offset === 0 && /bucket not found/i.test(error.message)) break;
    if (error) throw error;
    records.push(...await Promise.all(data.filter(file => /^[a-z0-9-]+\.json$/.test(file.name)).map(async file => {
      const result = await bucket.download(`gift-tags/${file.name}`);
      if (result.error) throw result.error;
      return JSON.parse(await result.data.text()) as GiftTagDesign;
    })));
    if (data.length < 100) break;
  }
  return mergeGiftTags(records, includeArchived);
}

export function saveGiftTag(tag: GiftTagDesign) {
  return writeCatalogueRecord(`gift-tags/${tag.id}.json`, tag);
}
