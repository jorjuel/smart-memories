import Image from 'next/image';
import Link from 'next/link';
import GiftTagSelection from '@/components/GiftTagSelection';
import GiftTagCollections from '@/components/GiftTagCollections';
import GiftTagPreview from '@/components/GiftTagPreview';
import { loadGiftTags } from '@/lib/giftTagCatalogueServer';
import { getProductPricePence } from '@/lib/pricing';
import { giftTagPackPricePence, giftTagPackSavings, giftTagPackSize } from '@/lib/giftTagPackPricing';
import { getCartShippingPricePence } from '@/lib/shippingPricing';
import DeliverySummary, { deliveryMoney } from '@/components/DeliverySummary';

export default async function GiftTagsPage({ searchParams }: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const price = deliveryMoney(getProductPricePence('memory-tag')).replace(/\.00$/, '');
  const tag = { productType: 'product', productSlug: 'memory-tag', quantity: 1 };
  const pack = { ...tag, quantity: giftTagPackSize };
  const tags = await loadGiftTags().catch(() => null);
  const available = [...new Set(tags?.map(design => design.collection))];
  const preferred = ['Christmas', 'Wedding', 'Flowers and Nature', 'Birthday Celebrations', 'Animals', 'Messages', 'Thank You'];
  const collections = [...preferred.filter(name => available.includes(name)), ...available.filter(name => !preferred.includes(name))];
  const savedCode = typeof code === 'string' && /^[A-HJ-NP-Z2-9]{8}$/.test(code) ? code : undefined;

  return (
    <div className="smCompactHome">
      {!savedCode && (
        <section className="memoryHomeHero" aria-labelledby="gift-tag-home-title">
          <div className="memoryHomeHeroCopy">
            <span className="v14Eyebrow">MEMORY GIFT TAGS</span>
            <h1 id="gift-tag-home-title">
              Give them a moment
              <br />
              <em>they can relive.</em>
            </h1>
            <p className="memoryHomeHeroLead">
              A birthday message in your own voice. A family video they&apos;ll treasure forever.
              A collection of moments they&apos;ll never want to lose. Attach a Smart Memory Gift Tag
              to their present and let them relive it with a simple tap.
            </p>
            <div className="smTagHeroPrice">
              <p><strong>{price}</strong> per tag with a satin bow</p>
              <p className="smTagPackOffer">
                Any {giftTagPackSize} for {deliveryMoney(giftTagPackPricePence)}
                <span>Mix and match · Save {deliveryMoney(giftTagPackSavings([pack]))}</span>
              </p>
              <small>UK standard delivery · {deliveryMoney(getCartShippingPricePence([tag], 'standard'))} for one tag · {deliveryMoney(getCartShippingPricePence([pack], 'standard'))} for three</small>
            </div>
            <div className="actions">
              <a className="btn big" href="#tag-designs">Choose a gift tag</a>
              <Link className="memoryHomeSecondaryButton" href="/m/sample">Try a sample memory</Link>
            </div>
            <div className="memoryHomeHeroTrust" aria-label="Gift tag details">
              <span>No app needed</span>
              <span>Photo, video &amp; voice message</span>
              <span>Each tag can open a different memory</span>
            </div>
          </div>
          <figure className="smTagHeroVisual">
            <Image className="smHomeHeroPhoto" src="/images/gift-tags-tap-hero-v2.webp"
              alt="A phone touching a gift tag on a ribbon-wrapped box, with a family photo, video and voice message on screen"
              width={1672} height={941} sizes="(max-width: 760px) calc(100vw - 36px), (max-width: 1200px) 48vw, 550px" preload />
            <figcaption>Example Smart Memory</figcaption>
          </figure>
        </section>
      )}
      <section className="wrap smTagStorefront">
      {savedCode && <h1 className="smTagStorefrontHeading">Choose another tag for your memory</h1>}
      <div id="tag-designs" className="smTagStorefrontHeading">
        <h2>Choose your tags</h2>
        <p>Choose a design, add your memory and pick a satin bow.</p>
      </div>
      <GiftTagSelection code={savedCode}>
      <label className="smTagSelectOption smTagCustomChoice">
        <input type="checkbox" name="selection" value="custom" />
        <span><strong>Create your own tag</strong><small>Upload an image to print on the tag.</small></span>
      </label>
      {!tags && <p role="status">Gift Tags are temporarily unavailable. Please try again shortly.</p>}
      {tags?.length === 0 && <p>No Gift Tags are available right now.</p>}
      <GiftTagCollections collections={collections.map(collection => ({
        title: collection === 'Flowers and Nature' ? 'Flowers & Nature' : collection,
        cards: tags?.filter(design => design.collection === collection).map(design => (
              <div key={design.id} className="smBowColour smTagDesignChoice">
                <GiftTagPreview name={design.name} image={design.image}>
                  <Image src={design.image} alt="" width={160} height={210} sizes="(max-width: 600px) 38vw, 160px"
                    unoptimized={design.image.startsWith('https://')} />
                </GiftTagPreview>
                <strong>{design.name}</strong>
                {design.description && <p>{design.description}</p>}
                <label className="smTagSelectOption"><input type="checkbox" name="selection" value={design.id} aria-label={`Select ${design.name}`} /> Select</label>
              </div>
        )),
      }))} />
      </GiftTagSelection>
      <DeliverySummary items={[tag]} />
      </section>
    </div>
  );
}
