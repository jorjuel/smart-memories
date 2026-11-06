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
  { number: '01', title: 'Create the memory', detail: 'Start with a message, photo, voice recording or video.' },
  { number: '02', title: 'Add a gift if you like', detail: 'Keep it digital, choose a satin-bow tag or add a personalised keepsake.' },
  { number: '03', title: 'They tap and relive', detail: 'A link, phone tap or QR scan brings the memory to life. No app needed.' },
];

export default function Home() {
  return (
    <main className="smCompactHome">
      <section className="memoryHomeHero" aria-labelledby="home-title">
        <div className="memoryHomeHeroCopy">
          <span className="v14Eyebrow">YOUR STORY COMES FIRST</span>
          <h1 id="home-title">
            Start with a memory.
            <br />
            <em>Make it a gift if you wish.</em>
          </h1>
          <p className="memoryHomeHeroLead">
            Create a personal message with words, a photo, your voice or a video.
            Then share it digitally, on a beautiful gift tag or with a keepsake.
          </p>
          <div className="actions">
            <Link className="btn big" href="/create">Create your Smart Memory</Link>
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

      <section className="section memoryHomeProducts" aria-labelledby="home-gifts-title">
        <div className="sectionHead">
          <div>
            <span className="v14Eyebrow">OPTIONAL GIFT ADD-ONS</span>
            <h2 id="home-gifts-title">The memory is the gift. Add a keepsake if you like.</h2>
          </div>
          <Link className="memoryHomeTextLink" href="/create">Start your memory →</Link>
        </div>
        <div className="products">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.slug} p={product} memoryFirst />
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
          <span className="v14Eyebrow">CREATE FOR AN OCCASION</span>
          <h2 id="home-occasions-title">Every occasion begins with a story.</h2>
        </div>
        <div className="smHomeOccasionLinks">
          {occasions.map((occasion) => (
            <Link
              key={occasion.name}
              href={`/create?occasion=${encodeURIComponent(occasion.name)}`}
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
