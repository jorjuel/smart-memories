import { supabaseAdmin } from './supabaseAdmin';
import { defaultCatalogueCards, snowflakeCardSlug, type CatalogueCard } from './cardDesigns';
import { products } from './products';

const bucketName = 'card-catalogue';

function bucketMissing(error: { message: string }) {
  return /bucket not found/i.test(error.message);
}

export async function loadCardCatalogue(): Promise<CatalogueCard[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    return defaultCatalogueCards;
  }

  const storage = supabaseAdmin().storage.from(bucketName);
  const files = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await storage.list('', { limit: 100, offset, sortBy: { column: 'name', order: 'asc' } });
    if (error && offset === 0 && bucketMissing(error)) return defaultCatalogueCards;
    if (error) throw error;
    files.push(...data.filter((file) => /^card-[a-z0-9-]+\.json$/.test(file.name)));
    if (data.length < 100) break;
  }

  const cards = new Map(defaultCatalogueCards.map((card) => [card.photoSlug, card]));
  const savedCards = await Promise.all(files.map(async ({ name }) => {
    const { data, error } = await storage.download(name);
    if (error) throw error;
    return JSON.parse(await data.text()) as CatalogueCard;
  }));
  for (const card of savedCards) {
    if (card.photoSlug !== snowflakeCardSlug) cards.set(card.photoSlug, card);
  }
  return [...cards.values()];
}

async function writeCatalogueRecord(path: string, record: object) {
  const storage = supabaseAdmin().storage;
  const { error: bucketError } = await storage.getBucket(bucketName);
  if (bucketError) {
    if (!bucketMissing(bucketError)) throw bucketError;
    const { error: createError } = await storage.createBucket(bucketName, {
      public: false, allowedMimeTypes: ['application/json'], fileSizeLimit: 16384,
    });
    if (createError && (await storage.getBucket(bucketName)).error) throw createError;
  }
  const { error } = await storage.from(bucketName).upload(path, JSON.stringify(record), {
    contentType: 'application/json', upsert: true, cacheControl: '0',
  });
  if (error) throw error;
}

export function saveCatalogueCard(card: CatalogueCard) {
  return writeCatalogueRecord(`${card.photoSlug}.json`, card);
}

export function saveGiftPrice(slug: string, pricePence: number) {
  return writeCatalogueRecord(`gift-prices/${slug}.json`, { pricePence });
}

export async function loadGiftPrices(): Promise<Record<string, number>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) return {};
  const bucket = supabaseAdmin().storage.from(bucketName);
  const { data, error } = await bucket.list('gift-prices', { limit: 100 });
  if (error && bucketMissing(error)) return {};
  if (error) throw error;
  const prices: Record<string, number> = {};
  await Promise.all(products.filter(({ slug }) => data.some(({ name }) => name === `${slug}.json`)).map(async ({ slug }) => {
    const { data: file, error: downloadError } = await bucket.download(`gift-prices/${slug}.json`);
    if (downloadError) throw downloadError;
    const { pricePence } = JSON.parse(await file.text());
    if (!Number.isSafeInteger(pricePence) || pricePence < 1 || pricePence > 99999) throw new Error('Invalid saved gift price');
    prices[slug] = pricePence;
  }));
  return prices;
}
