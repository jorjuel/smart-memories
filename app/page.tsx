import Link from 'next/link';
import Image from 'next/image';

const keepsakeCollections = [
  { title: 'Memory Tags', href: '/tags', image: '/images/memory-tags-still-life.webp' },
  { title: 'Smart Memory Gifts', href: '/shop#gifts', image: '/images/smart-memory-gift-still-life.webp' },
  { title: 'Handmade Cards', href: '/cards', image: '/Smart handcrafted cards/Handcrafted Mother’s Day Card for Mum.png' },
  { title: 'Gift Bundles', href: '/bundles', image: '/images/gift-bundles-still-life.webp' },
];

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

        <Image
          className="smHomeHeroPhoto"
          src="/images/home-hero-memory-still-life.webp"
          alt="A personalised photo slate beside a phone playing the same memory, with a ribbon gift tag in front"
          width={1448}
          height={1086}
          sizes="(max-width: 760px) calc(100vw - 32px), (max-width: 1200px) 48vw, 550px"
          preload
        />
      </section>

      <section className="section memoryHomeProducts" aria-labelledby="home-gifts-title">
        <div className="sectionHead">
          <div>
            <h2 id="home-gifts-title">Find the perfect keepsake.</h2>
          </div>
          <Link className="memoryHomeTextLink" href="/shop">View all gifts →</Link>
        </div>
        <div className="smHomeKeepsakes">
          {keepsakeCollections.map(({ title, href, image }) => (
            <Link key={href} href={href} className="smMemoryPathCard">
              <div className="smHomeKeepsakeImage">
                <Image src={image} alt="" fill sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 25vw" />
              </div>
              <h3><span>{title}</span><span aria-hidden="true">→</span></h3>
            </Link>
          ))}
        </div>
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
