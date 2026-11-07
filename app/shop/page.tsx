import Link from 'next/link';
import ProductCard from '../../components/ProductCard';
import { products } from '../../lib/products';

const occasionProducts: Record<string, string[]> = {
  Birthday: [
    'photo-mug',
    'smart-photo-slate',
    'coaster-set',
    'keyring',
    'white-t-shirt',
  ],
  Wedding: [
    'smart-photo-slate',
    'smart-memory-plaque',
    'photo-mug',
    'coaster-set',
    'keyring',
  ],
  Anniversary: [
    'smart-photo-slate',
    'smart-memory-plaque',
    'photo-mug',
    'keyring',
  ],
  Retirement: [
    'photo-mug',
    'smart-photo-slate',
    'mouse-mat',
    'keyring',
  ],
  'Leaving Gift': [
    'photo-mug',
    'mouse-mat',
    'smart-photo-slate',
    'keyring',
  ],
  'Teacher Gift': [
    'photo-mug',
    'mouse-mat',
    'coaster-set',
    'keyring',
  ],
  'Pet Memory': [
    'smart-photo-slate',
    'keyring',
    'photo-mug',
    'coaster-set',
    'mouse-mat',
  ],
  Remembrance: [
    'smart-memory-plaque',
    'smart-photo-slate',
    'keyring',
  ],
  'Family Memory': [
    'smart-photo-slate',
    'photo-mug',
    'coaster-set',
    'smart-memory-plaque',
  ],
  'New Baby': [
    'smart-photo-slate',
    'photo-mug',
    'smart-memory-plaque',
    'keyring',
  ],
  Graduation: [
    'photo-mug',
    'smart-photo-slate',
    'white-t-shirt',
    'keyring',
  ],
  Christmas: [
    'photo-mug',
    'coaster-set',
    'smart-photo-slate',
    'keyring',
  ],
  'Just Because': products.map((product) => product.slug),
};

const bundles = [
  {
    slug: 'birthday-bundle',
    name: 'Birthday Bundle',
    description: 'Mug + Coasters + Keyring',
    normalPrice: 36.97,
    bundlePrice: 32.99,
  },
  {
    slug: 'home-bundle',
    name: 'Home Bundle',
    description: 'Mug + Coasters + Mouse Mat',
    normalPrice: 42.97,
    bundlePrice: 37.99,
  },
  {
    slug: 'memory-bundle',
    name: 'Memory Bundle',
    description: 'Slate + Keyring + Mug',
    normalPrice: 46.97,
    bundlePrice: 41.99,
  },
  {
    slug: 'pet-memory-bundle',
    name: 'Pet Memory Bundle',
    description: 'Slate + Keyring + Coasters',
    normalPrice: 47.97,
    bundlePrice: 42.99,
  },
  {
    slug: 'work-teacher-bundle',
    name: 'Work & Teacher Bundle',
    description: 'Mug + Mouse Mat + Keyring',
    normalPrice: 36.97,
    bundlePrice: 32.99,
  },
];

const corporateBundles = [
  {
    name: 'Employee Welcome Pack',
    description: 'Mug + Mouse Mat + Keyring',
  },
  {
    name: 'Thank You Pack',
    description: 'Mug + Coasters + Keyring',
  },
  {
    name: 'Event Gift Pack',
    description: 'Mug + Keyring + White T-Shirt',
  },
  {
    name: 'Premium Client Pack',
    description: 'Aluminium Plaque + Mug + Coasters',
  },
  {
    name: 'Recognition Pack',
    description: 'Photo Slate + Keyring + Mug',
  },
  {
    name: 'Custom Corporate Bundle',
    description:
      'Build a branded pack around your event, team or customers.',
  },
];


function money(value: number) {
  return `£${value.toFixed(2)}`;
}

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<{ occasion?: string }>;
}) {
  const params = await searchParams;
  const occasion = params.occasion && occasionProducts[params.occasion] ? params.occasion : null;
  const allowed = occasion ? occasionProducts[occasion] : null;
  const filtered = allowed ? products.filter((p) => allowed.includes(p.slug)) : products;

  return (
    <section className="smSimpleShop">
      <div className="smSimpleShopHero smSimpleShopHeroEditorial">
        <span className="eyebrow">SMART MEMORIES · PERSONALISED GIFTS</span>
        <h1>{occasion ? `Gifts for ${occasion}` : <>Find a gift. Create a memory.<span>Make it unforgettable.</span></>}</h1>
        <p>Turn your favourite photos, voice recordings and heartfelt messages into something truly special. Celebrate the people, moments and stories you want to remember.</p>
        <p className="smSimpleShopTagline">Tap. Remember. Relive.</p>
      </div>

      {!occasion && (
        <div className="smSimpleShopShareIntro">
          <h2>How would you like to share your memory?</h2>
          <p>Both choices use the same photo, voice and message creator.<br />
            Make your memory first, then choose how it is presented.</p>
        </div>
      )}

      <div className="smSimpleShopShortcuts" aria-label="Shop categories">
        <Link href="#gifts">Personalised gifts</Link>
        <Link href="#cards">Handcrafted cards</Link>
        {!occasion && <Link href="#bundles">Bundles</Link>}
        {!occasion && <Link href="#corporate">Corporate gifts</Link>}
      </div>

      <section id="gifts" className="smSimpleShopSection">
        <div className="smSimpleShopSectionHead">
          <span className="eyebrow">{occasion ? 'YOUR SELECTED OCCASION' : 'OUR PRODUCTS'}</span>
          <h2>{occasion ? `Recommended for ${occasion}` : 'Choose your personalised gift'}</h2>
          <p>Choose your gift, then personalise it with your photo or message.</p>
        </div>
        <div className="smSimpleShopProducts">
          {filtered.length ? filtered.map((p) => <ProductCard key={p.slug} p={p} occasion={occasion ?? undefined} />) : (
            <p>There are no gifts in this category yet. <Link href="/shop">Browse all gifts.</Link></p>
          )}
        </div>
      </section>

      <section id="cards" className="smSimpleShopSection">
        <div className="smSimpleShopSectionHead">
          <span className="eyebrow">HANDCRAFTED CARDS</span>
          <h2>A real card. A memory to keep.</h2>
          <p>Choose a traditional printed card or add a tap-to-open Smart Memory.</p>
        </div>
        <div className="smSimpleShopFeatureGrid">
          <article className="card">
            <span className="eyebrow">CLASSIC CARD</span>
            <h3>Handcrafted keepsake card</h3>
            <p>Personalise your design and written message. No phone needed.</p>
            <strong>From £6.95</strong>
            <Link className="btn small" href={`/cards/personalise?cardType=traditional&occasion=${encodeURIComponent(occasion || 'Birthday')}&design=Floral%20Keepsake`}>Personalise card</Link>
          </article>
          <article className="card">
            <span className="eyebrow">WITH A SMART MEMORY</span>
            <h3>NFC Memory card</h3>
            <p>Include a private voice message, photo and written memory that opens with a tap or QR scan.</p>
            <strong>From £11.95</strong>
            <Link className="btn small" href={`/cards/personalise?cardType=smart&occasion=${encodeURIComponent(occasion || 'Birthday')}&design=Floral%20Keepsake`}>Personalise Smart card</Link>
          </article>
        </div>
        <p className="smSimpleShopNote">Optional printed photo costs £1.50 extra. Delivery is calculated at checkout.</p>
        <Link href="/cards">Browse all card designs</Link>
      </section>

      {!occasion && (
        <section id="bundles" className="smSimpleShopSection">
          <div className="smSimpleShopSectionHead">
            <span className="eyebrow">GIFT COLLECTIONS</span>
            <h2>More gifts, better value</h2>
            <p>Explore matching personalised gifts for the people who matter.</p>
          </div>
          <div className="smSimpleShopFeatureGrid">
            {bundles.map((bundle) => (
              <article className="card" key={bundle.slug}>
                <span className="eyebrow">GIFT BUNDLE</span>
                <h3>{bundle.name}</h3>
                <p>{bundle.description}</p>
                <strong>{money(bundle.bundlePrice)}</strong>
                <p className="smSimpleShopNote">Save {money(bundle.normalPrice - bundle.bundlePrice)}</p>
                <Link className="btn small" href={`/bundles/${bundle.slug}`}>View bundle</Link>
              </article>
            ))}
            <article className="card">
              <span className="eyebrow">BUILD YOUR OWN</span>
              <h3>Create your own bundle</h3>
              <p>Mix and match personalised gifts.</p>
              <Link className="btn small" href="/bundles/build-your-own">Build my bundle</Link>
            </article>
          </div>
        </section>
      )}

      {!occasion && (
        <section id="corporate" className="smSimpleShopSection">
          <div className="smSimpleShopSectionHead">
            <span className="eyebrow">BUSINESS GIFTING</span>
            <h2>Corporate and event gifts</h2>
            <p>Personalised gift packs for teams, events and clients.</p>
          </div>
          <div className="smSimpleShopFeatureGrid">
            {corporateBundles.map((bundle) => (
              <article className="card" key={bundle.name}>
                <span className="eyebrow">CORPORATE</span>
                <h3>{bundle.name}</h3>
                <p>{bundle.description}</p>
                <Link className="btn small" href={`/contact?type=corporate&bundle=${encodeURIComponent(bundle.name)}`}>Request a quote</Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
