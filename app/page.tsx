import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import DeliverySummary from '../components/DeliverySummary';
import { shopGiftProducts } from '../lib/products';

const occasions = [
  { name: 'Birthday', label: 'Birthdays' },
  { name: 'Wedding', label: 'Weddings' },
  { name: 'Anniversary', label: 'Anniversaries' },
  { name: 'Family Memory', label: 'Family' },
  { name: 'Pet Memory', label: 'Pets' },
  { name: 'New Baby', label: 'New baby' },
];

const steps = [
  { title: 'Choose a gift', detail: 'Pick a keepsake they can hold.' },
  { title: 'Add your memory', detail: 'Personalise it with a photo, a message or an optional voice recording.' },
  { title: 'They tap or scan', detail: 'Their memory opens on their phone. No app needed.' },
];

export default function Home() {
  return (
    <main className="smCompactHome">
      <section className="memoryHomeHero" aria-labelledby="home-title">
        <div className="memoryHomeHeroCopy">
          <span className="v14Eyebrow">PERSONALISED GIFTS WITH A STORY</span>
          <h1 id="home-title">
            A gift they can hold.
            <br />
            <em>A memory they can relive.</em>
          </h1>
          <p className="memoryHomeHeroLead">
            Add a photo, a message or your voice to a personalised gift.
            One simple tap brings the memory to life.
          </p>
          <div className="actions">
            <Link className="btn big" href="/shop">Shop personalised gifts</Link>
            <Link className="memoryHomeSecondaryButton" href="/how-it-works">
              How it works
            </Link>
          </div>
          <div className="memoryHomeHeroTrust" aria-label="Smart Memories benefits">
            <span>Personalised for them</span>
            <span>No app needed</span>
            <span>Tap or scan to open</span>
          </div>
        </div>

        <div className="smHeroMemoryShowcase" aria-label="Premium gift-wrapped keepsake and recipient phone memory preview">
          <div className="smHeroSlate" role="img" aria-label="Personalised photo slate of a couple">
            <div className="smHeroSlatePrint" />
          </div>

          <div className="smHeroRecipientPhone" aria-label="Example recipient Smart Memory phone screen">
            <div className="smHeroPhoneSpeaker" aria-hidden="true" />
            <div className="smHeroPhoneScreen">
              <span className="smHeroPhoneBrand">SMART MEMORIES</span>
              <div className="smHeroPhonePhoto" role="img" aria-label="Photo inside a Smart Memory" />
              <span className="smHeroPhoneEyebrow">A MESSAGE JUST FOR YOU</span>
              <h2>A moment worth keeping.</h2>
              <span className="smHeroPhoneVoice" aria-label="Illustration of an audio message">▶ &nbsp; A voice to remember</span>
              <small>With love, always ♡</small>
            </div>
          </div>

          <div
            className="smHeroBowTag"
            role="img"
            aria-label="Rose-gold satin ribbon bow with a Smart Memories hanging gift tag"
          />
        </div>
      </section>

      <nav className="smHomeCollections" aria-label="Shop collections">
        <Link href="/shop#gifts">Personalised Gifts <span aria-hidden="true">→</span></Link>
        <Link href="/cards">Handmade Cards <span aria-hidden="true">→</span></Link>
        <Link href="/bundles">Gift Bundles <span aria-hidden="true">→</span></Link>
      </nav>

      <section className="section memoryHomeProducts" aria-labelledby="home-gifts-title">
        <div className="sectionHead">
          <div>
            <span className="v14Eyebrow">POPULAR GIFTS</span>
            <h2 id="home-gifts-title">Find the perfect keepsake.</h2>
          </div>
          <Link className="memoryHomeTextLink" href="/shop">View all gifts →</Link>
        </div>
        <div className="smSimpleShopProducts" role="region" aria-labelledby="home-gifts-title" tabIndex={0}>
          {shopGiftProducts.map((product) => (
            <ProductCard key={product.slug} p={product} />
          ))}
        </div>
        <DeliverySummary />
      </section>

      <section className="memoryHomeHow" aria-labelledby="home-how-title">
        <div className="memoryHomeHowIntro">
          <span className="v14Eyebrow">HOW IT WORKS</span>
          <h2 id="home-how-title">See what they’ll open</h2>
          <Link className="smSampleLink" href="/m/sample"><span aria-hidden="true">▸</span> Try a sample memory</Link>
        </div>
        <ol className="memoryHomeSteps">
          {steps.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="memoryHomeOccasions" aria-labelledby="home-occasions-title">
        <div className="memoryHomeSectionIntro">
          <span className="v14Eyebrow">SHOP BY OCCASION</span>
          <h2 id="home-occasions-title">Every occasion has a story.</h2>
        </div>
        <div className="smHomeOccasionLinks">
          {occasions.map((occasion) => (
            <Link
              key={occasion.name}
              href={`/shop?occasion=${encodeURIComponent(occasion.name)}`}
            >
              {occasion.label} <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
        <div className="memoryHomeCentreAction">
          <Link className="memoryHomeTextLink" href="/occasions">
            Browse all occasions →
          </Link>
        </div>
      </section>
    </main>
  );
}
