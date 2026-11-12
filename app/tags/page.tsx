import Image from 'next/image';
import Link from 'next/link';
import { loadGiftTags } from '@/lib/giftTagCatalogueServer';
import { getProductPricePence } from '@/lib/pricing';
import DeliverySummary, { deliveryMoney } from '@/components/DeliverySummary';

export default async function GiftTagsPage({ searchParams }: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const tags = await loadGiftTags().catch(() => null);
  const collections = [...new Set(tags?.map(design => design.collection))];
  const savedCode = typeof code === 'string' && /^[A-HJ-NP-Z2-9]{8}$/.test(code) ? code : undefined;

  return (
    <section className="wrap">
      <h1>Memory Gift Tags</h1>
      <p className="lead">Choose a tag for your own present, then create the Smart Memory it will open.</p>
      <p><strong>{deliveryMoney(getProductPricePence('memory-tag'))} per tag</strong></p>
      {!tags && <p role="status">Gift Tags are temporarily unavailable. Please try again shortly.</p>}
      {tags?.length === 0 && <p>No Gift Tags are available right now.</p>}
      {collections.map(collection => (
        <section key={collection}>
          <h2>{collection}</h2>
          <div className="smTagCatalogue">
            {tags?.filter(design => design.collection === collection).map(design => (
              <Link key={design.id} className="smBowColour smTagDesignChoice"
                href={savedCode
                  ? { pathname: '/create/bow', query: { code: savedCode, design: design.id } }
                  : { pathname: '/create', query: { mode: 'tag', design: design.id } }}>
                <Image src={design.image} alt="" width={160} height={210} sizes="(max-width: 600px) 38vw, 160px"
                  unoptimized={design.image.startsWith('https://')} />
                <strong>{design.name}</strong>
                {design.description && <p>{design.description}</p>}
                <span>{savedCode ? 'Use this design' : 'Choose this design'}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
      <DeliverySummary items={[{ productType: 'product', productSlug: 'memory-tag', quantity: 1 }]} />
    </section>
  );
}
