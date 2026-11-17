import Image from 'next/image';
import Link from 'next/link';
import GiftTagSelection from '@/components/GiftTagSelection';
import { loadGiftTags } from '@/lib/giftTagCatalogueServer';
import { getProductPricePence } from '@/lib/pricing';
import DeliverySummary, { deliveryMoney } from '@/components/DeliverySummary';

export default async function GiftTagsPage({ searchParams }: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const tags = await loadGiftTags().catch(() => null);
  const collections = [...new Set(tags?.map(design => design.collection))];
  const winterForestIndex = collections.indexOf('Winter Forest');
  const christmasIndex = collections.indexOf('Christmas');
  if (winterForestIndex !== -1 && christmasIndex !== -1) {
    collections.splice(christmasIndex, 1);
    collections.splice(collections.indexOf('Winter Forest') + 1, 0, 'Christmas');
  }
  const savedCode = typeof code === 'string' && /^[A-HJ-NP-Z2-9]{8}$/.test(code) ? code : undefined;

  return (
    <div className="smCompactHome">
      {!savedCode && (
        <section className="memoryHomeHero" aria-labelledby="gift-tag-home-title">
          <div className="memoryHomeHeroCopy">
            <span className="v14Eyebrow">MEMORY GIFT TAGS</span>
            <h1 id="gift-tag-home-title">
              A gift they can hold.
              <br />
              <em>A memory they can relive.</em>
            </h1>
            <p className="memoryHomeHeroLead">
              A photo that takes them back. A voice they’d love to hear again.
              Add it to a gift tag they can tap or scan to open.
            </p>
            <div className="actions">
              <a className="btn big" href="#tag-designs">Choose a gift tag</a>
              <Link className="memoryHomeSecondaryButton" href="/m/sample">Try a sample memory</Link>
            </div>
            <div className="memoryHomeHeroTrust" aria-label="Gift tag details">
              <span>{deliveryMoney(getProductPricePence('memory-tag'))} per tag</span>
              <span>No app needed</span>
              <span>Tap or scan to open</span>
            </div>
          </div>
          <Image className="smHomeHeroPhoto" src="/images/memory-tags-occasions-still-life.webp"
            alt="Birthday, Christmas and wedding gift tags beside a wrapped gift and a phone playing a memory"
            width={1672} height={941} sizes="(max-width: 760px) calc(100vw - 36px), (max-width: 1200px) 48vw, 550px" preload />
        </section>
      )}
      <section className="wrap smTagStorefront">
      {savedCode && <h1 className="smTagStorefrontHeading">Choose another tag for your memory</h1>}
      <div id="tag-designs" className="smTagStorefrontHeading">
        <h2>Choose your tags</h2>
        <p>Select one or more designs, then personalise each tag.</p>
      </div>
      {collections.length > 0 && (
        <nav className="smTagCollectionNav" aria-label="Tag collections">
          {collections.map(collection => <a key={collection} href={`#${encodeURIComponent(collectionId(collection))}`}>{collection}</a>)}
        </nav>
      )}
      <GiftTagSelection code={savedCode}>
      <label className="smTagSelectOption smTagCustomChoice">
        <input type="checkbox" name="selection" value="custom" />
        <span><strong>Create your own tag</strong><small>Upload an image to print on the tag.</small></span>
      </label>
      {!tags && <p role="status">Gift Tags are temporarily unavailable. Please try again shortly.</p>}
      {tags?.length === 0 && <p>No Gift Tags are available right now.</p>}
      {collections.map(collection => (
        <section key={collection} id={collectionId(collection)} className="smTagStorefrontCollection">
          <h3>{collection}</h3>
          <div className="smTagCatalogue">
            {tags?.filter(design => design.collection === collection).map(design => (
              <label key={design.id} className="smBowColour smTagDesignChoice">
                <Image src={design.image} alt="" width={160} height={210} sizes="(max-width: 600px) 38vw, 160px"
                  unoptimized={design.image.startsWith('https://')} />
                <strong>{design.name}</strong>
                {design.description && <p>{design.description}</p>}
                <span className="smTagSelectOption"><input type="checkbox" name="selection" value={design.id} aria-label={`Select ${design.name}`} /> Select this design</span>
              </label>
            ))}
          </div>
        </section>
      ))}
      </GiftTagSelection>
      <DeliverySummary items={[{ productType: 'product', productSlug: 'memory-tag', quantity: 1 }]} />
      </section>
    </div>
  );
}

function collectionId(collection: string) {
  return `collection-${encodeURIComponent(collection)}`;
}
