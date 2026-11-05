import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import { products } from '../lib/products';

const occasions = [
  { name: 'Birthday', label: 'Birthdays' },
  { name: 'Wedding', label: 'Weddings' },
  { name: 'Anniversary', label: 'Anniversaries' },
  { name: 'Family Memory', label: 'Family' },
  { name: 'Pet Memory', label: 'Pets' },
  { name: 'New Baby', label: 'New baby' },
];

const steps = [
  { number: '01', title: 'Choose a gift', detail: 'Pick a keepsake they can hold.' },
  { number: '02', title: 'Add your memory', detail: 'Personalise it with photos, words and an optional voice recording.' },
  { number: '03', title: 'They tap and relive', detail: 'A phone tap or QR scan opens their memory. No app needed.' },
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

        <div className="smHeroMemoryShowcase" aria-label="Example photo slate, recipient phone memory and Smart Memories tap tag">
          <div className="smHeroSlate" role="img" aria-label="Example personalised photographic slate">
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

          <div className="smHeroNfcTag" aria-label="Illustration of a Smart Memories NFC tap tag">
            <span className="smHeroTagSignal" aria-hidden="true">◖))</span>
            <span className="smHeroTagBrand">SMART MEMORIES <span aria-hidden="true">♥</span></span>
            <strong>Tap here</strong>
          </div>
        </div>
      </section>

      <section className="section memoryHomeProducts" aria-labelledby="home-gifts-title">
        <div className="sectionHead">
          <div>
            <span className="v14Eyebrow">POPULAR GIFTS</span>
            <h2 id="home-gifts-title">Find the perfect keepsake.</h2>
          </div>
          <Link className="memoryHomeTextLink" href="/shop">View all gifts →</Link>
        </div>
        <div className="products">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.slug} p={product} />
          ))}
        </div>
      </section>

      <section className="memoryHomeHow" aria-labelledby="home-how-title">
        <div className="memoryHomeSectionIntro lightSection">
          <span className="v14Eyebrow light">HOW IT WORKS</span>
          <h2 id="home-how-title">Three steps to something unforgettable.</h2>
        </div>
        <div className="memoryHomeSteps">
          {steps.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
        <Link className="memoryHomeLightLink" href="/how-it-works">
          See how Smart Memories works →
        </Link>
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
