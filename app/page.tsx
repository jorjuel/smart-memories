import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import { products } from '../lib/products';

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="v14Hero">
        <div className="v14HeroContent">
          <span className="v14Eyebrow">
            PERSONALISED GIFTS WITH A SMARTER HEART
          </span>

          <h1>
            A photograph
            <br />
            they can <em>hear.</em>
          </h1>

          <p className="v14HeroLead">
            Turn a beautiful personalised gift into something more.
            Add a photograph, your words and your own voice.
            One simple tap brings the memory back.
          </p>

          <div className="actions">
            <Link className="btn big" href="/shop">
              Explore Smart Gifts
            </Link>

            <Link className="v14TextButton" href="/how-it-works">
              See how it works →
            </Link>
          </div>

          <div className="v14Trust">
            <span>Personalised for them</span>
            <span>Hidden NFC memory</span>
            <span>QR backup</span>
            <span>Your own voice</span>
          </div>
        </div>

        <div className="v14HeroVisual">
          <div className="v14PhotoFrame">
            <div className="v14PhotoPlaceholder">
              <span>YOUR PHOTO</span>
            </div>

            <div className="v14MemoryCard">
              <span className="v14MiniLabel">A MEMORY FOR SARAH</span>

              <div className="v14Heart">♥</div>

              <h2>Little things from the past.</h2>

              <button type="button" className="v14Play">
                ▶ PLAY MY MESSAGE
              </button>

              <p>With love always, Leo</p>
            </div>
          </div>

          <div className="v14TapBadge">
            <strong>TAP</strong>
            <span>to hear the memory</span>
          </div>
        </div>
      </section>

      {/* EMOTIONAL INTRO */}
      <section className="v14Intro">
        <span className="v14Eyebrow">MORE THAN A PERSONALISED GIFT</span>

        <h2>
          Keep the photograph.
          <br />
          Keep the voice.
          <br />
          Keep the moment.
        </h2>

        <p>
          Every Smart Memories gift can connect to a private digital
          memory page. The person receiving it simply taps the hidden
          NFC point with their phone — or scans the QR backup — to see
          the photograph, read your message and hear your voice.
        </p>
      </section>

      {/* PRODUCTS */}
      <section className="section v14ProductsSection">
        <div className="sectionHead">
          <div>
            <span className="v14Eyebrow">THE SMART MEMORIES COLLECTION</span>
            <h2>Made to mean something.</h2>
          </div>

          <Link className="v14TextButton" href="/shop">
            Explore all gifts →
          </Link>
        </div>

        <div className="products">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.slug} p={product} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="v14How">
        <div className="v14HowIntro">
          <span className="v14Eyebrow light">HOW SMART MEMORIES WORKS</span>

          <h2>Three simple steps. One unforgettable gift.</h2>
        </div>

        <div className="v14Steps">
          <article>
            <span className="v14StepNumber">01</span>
            <h3>Choose your gift</h3>
            <p>
              Pick a photo gift, keepsake, handcrafted card or special
              bundle for the person and occasion.
            </p>
          </article>

          <article>
            <span className="v14StepNumber">02</span>
            <h3>Add your memory</h3>
            <p>
              Upload your photograph, write a personal message and
              record the voice message you want them to keep.
            </p>
          </article>

          <article>
            <span className="v14StepNumber">03</span>
            <h3>They tap and remember</h3>
            <p>
              A hidden NFC tag connects the physical gift to its
              digital memory. A QR code provides a simple backup.
            </p>
          </article>
        </div>

        <Link className="btn" href="/create">
          Create a Smart Memory
        </Link>
      </section>

      {/* HANDCRAFTED CARDS */}
      <section className="v14CardsFeature">
        <div className="v14CardsVisual">
          <div className="v14CardBack"></div>

          <div className="v14CardFront">
            <span>HANDCRAFTED FOR YOU</span>
            <div className="v14CardHeart">♥</div>
            <h3>Happy Birthday</h3>
            <p>A little card with a memory hidden inside.</p>
          </div>
        </div>

        <div className="v14CardsCopy">
          <span className="v14Eyebrow">HANDCRAFTED SMART CARDS</span>

          <h2>
            Traditional on the outside.
            <br />
            Smart on the inside.
          </h2>

          <p>
            For people who still love the feeling of receiving a real,
            handcrafted card. Choose the occasion, select your design
            and personalise the message — then add an optional Smart
            Memory with your photograph and voice.
          </p>

          <div className="v14Occasions">
            <span>Birthday</span>
            <span>Wedding</span>
            <span>Anniversary</span>
            <span>New Baby</span>
            <span>Christmas</span>
            <span>Thank You</span>
            <span>Remembrance</span>
            <span>+ more</span>
          </div>

          <Link className="btn" href="/cards">
            Explore Handcrafted Cards
          </Link>
        </div>
      </section>

      {/* BUNDLES */}
      <section className="v14Bundles">
        <div className="v14BundleHeading">
          <span className="v14Eyebrow">MORE WAYS TO MAKE IT PERSONAL</span>
          <h2>Gifts for one person. Or a hundred.</h2>
          <p>
            From thoughtful individual keepsakes to celebrations,
            events and branded corporate gifting.
          </p>
        </div>

        <div className="v14BundleGrid">
          <article>
            <span className="v14BundleIcon">♥</span>
            <h3>Special Bundles</h3>
            <p>
              Combine mugs, coasters, keyrings, cards and keepsakes
              into one personalised gift collection.
            </p>
            <Link href="/shop">View bundles →</Link>
          </article>

          <article>
            <span className="v14BundleIcon">✦</span>
            <h3>Celebrations & Social</h3>
            <p>
              Personalised gifts for birthdays, weddings, parties,
              anniversaries, reunions and special events.
            </p>
            <Link href="/occasions">Explore occasions →</Link>
          </article>

          <article>
            <span className="v14BundleIcon">SM</span>
            <h3>Corporate Gifting</h3>
            <p>
              Branded products and memorable gift packs for teams,
              customers, events and business celebrations.
            </p>
            <Link href="/contact">Talk to us →</Link>
          </article>
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section className="v14Technology">
        <div>
          <span className="v14Eyebrow light">THE SMART PART</span>

          <h2>
            The technology disappears.
            <br />
            The memory remains.
          </h2>

          <p>
            The NFC chip does not hold your photograph or recording.
            It simply opens the unique Smart Memory connected to your
            gift. That means the physical keepsake stays beautifully
            simple while the memory lives securely online.
          </p>
        </div>

        <div className="v14TechPoints">
          <div>
            <strong>NFC</strong>
            <span>Tap with a compatible smartphone</span>
          </div>

          <div>
            <strong>QR</strong>
            <span>A simple backup way to open the memory</span>
          </div>

          <div>
            <strong>VOICE</strong>
            <span>Let them hear the person behind the gift</span>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="v14FinalCta">
        <span className="v14Eyebrow">CREATE SOMETHING THEY CAN KEEP</span>

        <h2>
          Some moments deserve to be heard
          <br />
          as well as seen.
        </h2>

        <p>
          Start with a photograph. Add your words. Add your voice.
          Turn it into a memory they can return to with one tap.
        </p>

        <div className="actions">
          <Link className="btn big" href="/shop">
            Find Their Gift
          </Link>

          <Link className="v14TextButton" href="/create">
            I already have a memory →
          </Link>
        </div>
      </section>
    </>
  );
}
