import Link from 'next/link';

import ProductCard from '../components/ProductCard';

import {
  products,
} from '../lib/products';

const occasions = [
  {
    name: 'Birthday',
    text: 'Celebrate their story, not just another birthday.',
  },
  {
    name: 'Wedding',
    text: 'Keep the voices, photographs and moments from the day.',
  },
  {
    name: 'Anniversary',
    text: 'Bring a favourite moment back with one simple tap.',
  },
  {
    name: 'Family Memory',
    text: 'Preserve the photographs, words and voices that matter.',
  },
  {
    name: 'Pet Memory',
    text: 'Keep their personality, photographs and special moments close.',
  },
  {
    name: 'New Baby',
    text: 'Save the beginnings you never want to forget.',
  },
  {
    name: 'Retirement',
    text: 'Turn years of memories into something they can revisit.',
  },
  {
    name: 'Just Because',
    text: 'Some memories do not need an occasion.',
  },
];

const experiences = [
  {
    number: '01',
    title: 'Photos',
    text: 'Start with the photographs that tell the story.',
  },
  {
    number: '02',
    title: 'Voice',
    text: 'Record the words only you can say in your own voice.',
  },
  {
    number: '03',
    title: 'Video',
    text: 'Add moving moments when a photograph is not enough.',
  },
  {
    number: '04',
    title: 'Personal Message',
    text: 'Write the words you want them to return to again and again.',
  },
];

export default function Home() {
  return (
    <>
      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="memoryHomeHero">
        <div className="memoryHomeHeroCopy">
          <span className="v14Eyebrow">
            MORE THAN A PERSONALISED GIFT
          </span>

          <h1>
            Some gifts hold a photo.
            <br />
            <em>
              Smart Memories holds
              the story.
            </em>
          </h1>

          <p className="memoryHomeHeroLead">
            Tap your gift to hear
            their voice, see their
            photos, watch their
            moments and relive the
            memories that matter.
          </p>

          <div className="memoryHomeBrandLine">
            Tap.
            <span>
              Remember.
            </span>
            Relive.
          </div>

          <div className="actions">
            <Link
              className="btn big"
              href="/shop"
            >
              Create a Smart Memory
            </Link>

            <Link
              className="memoryHomeSecondaryButton"
              href="/how-it-works"
            >
              See How It Works
            </Link>
          </div>

          <div className="memoryHomeHeroTrust">
            <span>
              No app required
            </span>

            <span>
              NFC tap
            </span>

            <span>
              QR backup
            </span>

            <span>
              Made to be remembered
            </span>
          </div>
        </div>

        <div
          className="memoryHomeHeroExperience"
          aria-label="Example Smart Memory"
        >
          <div className="memoryHomeGiftCard">
            <div className="memoryHomeGiftPhoto">
              <span>
                YOUR FAVOURITE PHOTO
              </span>
            </div>

            <div className="memoryHomeTapPoint">
              <span>
                TAP
              </span>
            </div>
          </div>

          <div className="memoryHomePhone">
            <div className="memoryHomePhoneTop">
              SMART MEMORY
            </div>

            <div className="memoryHomePhonePhoto">
              <span>
                A MEMORY FOR SOMEONE
                SPECIAL
              </span>
            </div>

            <div className="memoryHomePhoneContent">
              <small>
                A SPECIAL MESSAGE
              </small>

              <h2>
                This moment still
                sounds like you.
              </h2>

              <button
                type="button"
                className="memoryHomePlay"
              >
                ▶ Play My Message
              </button>

              <p>
                With love, always.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          EMOTIONAL INTRO
          ===================================================== */}

      <section className="memoryHomeStatement">
        <span className="v14Eyebrow">
          THE MEMORY IS THE GIFT
        </span>

        <h2>
          A photograph shows
          the moment.
          <br />
          A voice brings it
          back.
        </h2>

        <p>
          Smart Memories connects
          a physical personalised
          gift to a digital memory
          that can hold the things
          a photograph cannot:
          voices, videos, messages
          and the story behind the
          moment.
        </p>
      </section>

      {/* =====================================================
          HOW IT WORKS
          ===================================================== */}

      <section
        className="memoryHomeHow"
        id="how-it-works"
      >
        <div className="memoryHomeSectionIntro lightSection">
          <span className="v14Eyebrow light">
            HOW IT WORKS
          </span>

          <h2>
            Create it once.
            <br />
            Relive it with a tap.
          </h2>

          <p>
            The technology stays
            quietly in the
            background. The memory
            stays at the centre.
          </p>
        </div>

        <div className="memoryHomeSteps">
          <article>
            <span>
              01
            </span>

            <h3>
              Choose the gift
            </h3>

            <p>
              Pick one of our
              existing Smart Memory
              products or gift
              collections.
            </p>
          </article>

          <article>
            <span>
              02
            </span>

            <h3>
              Build the memory
            </h3>

            <p>
              Add your photograph,
              message and voice,
              with video where
              available.
            </p>
          </article>

          <article>
            <span>
              03
            </span>

            <h3>
              We connect it
            </h3>

            <p>
              Your gift is linked
              to its unique Smart
              Memory using NFC and
              a QR backup.
            </p>
          </article>

          <article>
            <span>
              04
            </span>

            <h3>
              They tap and relive
            </h3>

            <p>
              One tap opens the
              memory on their phone.
              No special app is
              needed.
            </p>
          </article>
        </div>

        <Link
          className="btn big"
          href="/shop"
        >
          Start Creating
        </Link>
      </section>

      {/* =====================================================
          OCCASIONS
          ===================================================== */}

      <section className="memoryHomeOccasions">
        <div className="memoryHomeSectionIntro">
          <span className="v14Eyebrow">
            WHAT MEMORY ARE YOU CREATING?
          </span>

          <h2>
            Start with the person,
            the moment or the story.
          </h2>

          <p>
            You do not have to know
            which product you want
            first. Start with what
            the memory means.
          </p>
        </div>

        <div className="memoryHomeOccasionGrid">
          {occasions.map(
            (
              occasion
            ) => (
              <Link
                key={
                  occasion.name
                }
                href={`/shop?occasion=${encodeURIComponent(
                  occasion.name
                )}`}
                className="memoryHomeOccasionCard"
              >
                <span>
                  SMART MEMORY
                </span>

                <h3>
                  {
                    occasion.name
                  }
                </h3>

                <p>
                  {
                    occasion.text
                  }
                </p>

                <strong>
                  Explore memories →
                </strong>
              </Link>
            )
          )}
        </div>

        <div className="memoryHomeCentreAction">
          <Link
            className="memoryHomeTextLink"
            href="/occasions"
          >
            Explore all occasions →
          </Link>
        </div>
      </section>

      {/* =====================================================
          MEMORY EXPERIENCE
          ===================================================== */}

      <section className="memoryHomeExperience">
        <div className="memoryHomeSectionIntro">
          <span className="v14Eyebrow">
            YOUR STORY, IN MORE THAN ONE WAY
          </span>

          <h2>
            See it.
            Hear it.
            Feel it again.
          </h2>

          <p>
            Build a richer memory
            from the pieces that
            make a moment personal.
          </p>
        </div>

        <div className="memoryHomeExperienceGrid">
          {experiences.map(
            (
              experience
            ) => (
              <article
                key={
                  experience.title
                }
              >
                <span className="memoryHomeExperienceNumber">
                  {
                    experience.number
                  }
                </span>

                <h3>
                  {
                    experience.title
                  }
                </h3>

                <p>
                  {
                    experience.text
                  }
                </p>
              </article>
            )
          )}
        </div>
      </section>

      {/* =====================================================
          TAP DEMONSTRATION
          ===================================================== */}

      <section className="memoryHomeTapDemo">
        <div className="memoryHomeTapCopy">
          <span className="v14Eyebrow light">
            THE MOMENT IT COMES ALIVE
          </span>

          <h2>
            One small tap.
            <br />
            A whole story returns.
          </h2>

          <p>
            The recipient simply taps
            the Smart Memory point
            with a compatible phone,
            or scans the QR backup.
            Their memory opens in the
            browser.
          </p>

          <Link
            className="memoryHomeLightLink"
            href="/how-it-works"
          >
            See the full experience →
          </Link>
        </div>

        <div className="memoryHomeTapVisual">
          <div className="memoryHomePhysicalGift">
            <span className="memoryHomePhysicalLabel">
              YOUR PERSONALISED GIFT
            </span>

            <div className="memoryHomePhysicalPhoto">
              MEMORY
            </div>

            <div className="memoryHomeNfcMark">
              NFC
            </div>
          </div>

          <div className="memoryHomeTapArrow">
            TAP
            <span>
              →
            </span>
          </div>

          <div className="memoryHomeMiniPhone">
            <small>
              SMART MEMORIES
            </small>

            <h3>
              A special message
              just for you.
            </h3>

            <div className="memoryHomeMiniPlay">
              ▶
            </div>

            <strong>
              PLAY MY MESSAGE
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          HERO PRODUCTS
          ===================================================== */}

      <section className="section memoryHomeProducts">
        <div className="sectionHead">
          <div>
            <span className="v14Eyebrow">
              SMART MEMORY GIFTS
            </span>

            <h2>
              Choose what holds
              the story.
            </h2>

            <p>
              The physical gift is
              the beginning. The
              Smart Memory is what
              makes it yours.
            </p>
          </div>

          <Link
            className="memoryHomeTextLink"
            href="/shop"
          >
            See all products →
          </Link>
        </div>

        <div className="products">
          {products
            .slice(
              0,
              3
            )
            .map(
              (
                product
              ) => (
                <ProductCard
                  key={
                    product.slug
                  }
                  p={
                    product
                  }
                />
              )
            )}
        </div>
      </section>

      {/* =====================================================
          TRUST
          ===================================================== */}

      <section className="memoryHomeTrust">
        <div className="memoryHomeSectionIntro">
          <span className="v14Eyebrow">
            MADE FOR REAL MEMORIES
          </span>

          <h2>
            Personal by design.
          </h2>

          <p>
            Smart Memories is designed
            so the technology supports
            the experience instead of
            becoming the experience.
          </p>
        </div>

        <div className="memoryHomeTrustGrid">
          <article>
            <strong>
              UNIQUE
            </strong>

            <h3>
              One gift.
              One Smart Memory.
            </h3>

            <p>
              Each Smart Memory has
              its own unique link
              connected to the gift.
            </p>
          </article>

          <article>
            <strong>
              SIMPLE
            </strong>

            <h3>
              Nothing to install.
            </h3>

            <p>
              The recipient opens
              their memory directly
              in their phone browser.
            </p>
          </article>

          <article>
            <strong>
              BACKED UP
            </strong>

            <h3>
              NFC plus QR.
            </h3>

            <p>
              A QR code provides a
              second simple way to
              open the same Smart
              Memory.
            </p>
          </article>

          <article>
            <strong>
              YOUR STORY
            </strong>

            <h3>
              More than a print.
            </h3>

            <p>
              Combine photographs,
              words, voice and
              memories in one
              experience.
            </p>
          </article>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
          ===================================================== */}

      <section className="memoryHomeFinal">
        <span className="v14Eyebrow light">
          TAP. REMEMBER. RELIVE.
        </span>

        <h2>
          What story do you want
          them to keep?
        </h2>

        <p>
          Start with the memory.
          We will help you turn it
          into something they can
          hold, tap and return to.
        </p>

        <div className="actions">
          <Link
            className="btn big"
            href="/shop"
          >
            Create My Smart Memory
          </Link>

          <Link
            className="memoryHomeLightLink"
            href="/how-it-works"
          >
            See How It Works
          </Link>
        </div>
      </section>
    </>
  );
}