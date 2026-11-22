import './gift-tags.css';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import GiftTagSelection from '@/components/GiftTagSelection';
import GiftTagReviewPreview from '@/components/GiftTagReviewPreview';
import { loadGiftTags } from '@/lib/giftTagCatalogueServer';
import { getProductPricePence } from '@/lib/pricing';
import { giftTagPackPricePence, giftTagPackSavings, giftTagPackSize } from '@/lib/giftTagPackPricing';
import { getCartShippingPricePence } from '@/lib/shippingPricing';
import DeliverySummary, { deliveryMoney } from '@/components/DeliverySummary';

const description = 'Give a gift they can relive. Add photos, videos, written messages and voice recordings to a Smart Memory Gift Tag. From £7.99, or mix and match any three for £19.99.';

const metadata: Metadata = {
  title: 'Memory Gift Tags | Smart Memories',
  description,
  alternates: { canonical: 'https://smartmemories.co.uk/tags' },
  openGraph: { title: 'Memory Gift Tags | Smart Memories', description, url: 'https://smartmemories.co.uk/tags' },
};

type GiftTagsPageProps = {
  searchParams: Promise<{ code?: string; cta?: string; reviews?: string }>;
};

export async function generateMetadata({ searchParams }: GiftTagsPageProps): Promise<Metadata> {
  const { code, reviews } = await searchParams;
  return code || reviews === 'preview' ? { ...metadata, robots: { index: false } } : metadata;
}

const ctaLabels = {
  a: 'Choose a gift tag',
  b: 'Create your memory tag',
  c: 'Start creating',
};

const steps = [
  { title: 'Choose a tag', detail: 'Pick a design that feels like them.' },
  { title: 'Add your memories', detail: 'Share photos, videos, words or a voice recording.' },
  { title: 'They tap and relive it', detail: 'Their memory opens on their phone.' },
];

export default async function GiftTagsPage({ searchParams }: GiftTagsPageProps) {
  const { code, cta, reviews } = await searchParams;
  const savedCode = typeof code === 'string' && /^[A-HJ-NP-Z2-9]{8}$/.test(code) ? code : undefined;
  const ctaVariant = cta === 'b' || cta === 'c' ? cta : 'a';
  const tag = { productType: 'product', productSlug: 'memory-tag', quantity: 1 };
  const pack = { ...tag, quantity: giftTagPackSize };
  const tags = await loadGiftTags().catch(() => null);

  return (
    <div className="smCompactHome smGiftTagsPage">
      {!savedCode && (
        <section className="memoryHomeHero smGiftTagsHero" aria-labelledby="gift-tag-home-title">
          <div className="memoryHomeHeroCopy">
            <span className="v14Eyebrow">MEMORY GIFT TAGS</span>
            <h1 id="gift-tag-home-title">
              Give them a moment <em>they can relive.</em>
            </h1>
            <p className="memoryHomeHeroLead">
              Give them your voice, a favourite photo or a video they can watch again.
              Add it to a gift tag and they can tap or scan to open their memory on their phone.
            </p>
            <div className="smTagHeroPrice">
              <p><strong>{deliveryMoney(getProductPricePence('memory-tag'))}</strong> per tag with a satin bow</p>
              <p className="smTagPackOffer">
                <b>Any {giftTagPackSize} for {deliveryMoney(giftTagPackPricePence)}</b>
                <span>Save {deliveryMoney(giftTagPackSavings([pack]))}</span>
              </p>
              <small>Mix and match designs. UK delivery from {deliveryMoney(getCartShippingPricePence([tag], 'standard'))}.</small>
            </div>
            {reviews === 'preview' && <GiftTagReviewPreview />}
            <div className="actions">
              <a className="btn big" href="#tag-designs" data-cta-variant={ctaVariant}>{ctaLabels[ctaVariant]}</a>
              <Link className="memoryHomeSecondaryButton" href="/m/sample">See a memory come to life</Link>
            </div>
            <ul className="memoryHomeHeroTrust" aria-label="Gift tag details">
              <li><span>No app needed</span></li>
              <li><span>Tap or scan to open</span></li>
              <li><span>Photo, video &amp; voice message</span></li>
              <li><span>Each tag can open a different memory</span></li>
            </ul>
          </div>
          <figure className="smTagHeroVisual">
            <Image className="smHomeHeroPhoto" src="/images/gift-tags-tap-hero-v2.webp"
              alt="A ribbon-wrapped gift with a Smart Memory Gift Tag beside a phone showing a family photo, video and voice message"
              width={1672} height={941} sizes="(max-width: 760px) calc(100vw - 36px), (max-width: 1320px) 53vw, 650px" preload />
            <figcaption>Example Smart Memory on a recipient’s phone</figcaption>
          </figure>
        </section>
      )}

      <GiftTagSelection code={savedCode} tags={tags} intro={!savedCode && (
        <section className="smTagHow" aria-labelledby="tag-how-title">
          <h2 id="tag-how-title">How it works</h2>
          <ol>
            {steps.map(({ title, detail }) => (
              <li key={title}><div><strong>{title}</strong><p>{detail}</p></div></li>
            ))}
          </ol>
        </section>
      )}>
        <DeliverySummary items={[tag]} />
      </GiftTagSelection>
    </div>
  );
}
