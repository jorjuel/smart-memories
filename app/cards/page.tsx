'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

const occasions = [
  'Birthday',
  'Wedding',
  'Anniversary',
  'New Baby',
  'Christmas',
  "Valentine's",
  "Mother's Day",
  "Father's Day",
  'Graduation',
  'Retirement',
  'Thank You',
  'Remembrance',
];

const designs = [
  {
    name: 'Floral Keepsake',
    style: 'floral',
    description: 'Soft florals with a warm handmade finish.',
  },
  {
    name: 'Classic Elegance',
    style: 'classic',
    description: 'Timeless typography and traditional detailing.',
  },
  {
    name: 'Rustic Handmade',
    style: 'rustic',
    description: 'Natural textures and a handcrafted character.',
  },
  {
    name: 'Modern Minimal',
    style: 'minimal',
    description: 'Clean, contemporary and beautifully simple.',
  },
  {
    name: 'Photo Feature',
    style: 'photo',
    description: 'Make a favourite photograph the centrepiece.',
  },
  {
    name: 'Luxury Gold',
    style: 'gold',
    description: 'An elegant design inspired by luxury stationery.',
  },
  {
    name: 'Watercolour',
    style: 'watercolour',
    description: 'Gentle painted details with a personal feel.',
  },
  {
    name: 'Layered Paper',
    style: 'layered',
    description: 'A dimensional look inspired by paper craft.',
  },
  {
    name: 'Contemporary Type',
    style: 'type',
    description: 'Bold typography for a modern celebration.',
  },
  {
    name: 'Signature Bespoke',
    style: 'signature',
    description: 'A premium personalised design made to feel unique.',
  },
];

export default function CardsPage() {
  const [occasion, setOccasion] = useState('Birthday');

  const currentDesigns = useMemo(
    () =>
      designs.map((design, index) => ({
        ...design,
        id: `${occasion}-${index + 1}`,
      })),
    [occasion]
  );

  return (
    <>
      <section className="cardsHero">
        <div>
          <span className="v14Eyebrow">HANDCRAFTED SMART CARDS</span>

          <h1>
            A real card.
            <br />
            A hidden memory.
          </h1>

          <p>
            Choose a handcrafted design for the occasion and make it
            completely personal. Add their name, your message, a photograph
            and, if you wish, a Smart Memory they can hear with one tap.
          </p>

          <div className="cardsHeroFeatures">
            <span>Handcrafted style</span>
            <span>Personalised message</span>
            <span>Optional photograph</span>
            <span>Optional NFC + QR memory</span>
          </div>
        </div>

        <div className="cardsHeroArt">
          <div className="cardsHeroBack"></div>

          <div className="cardsHeroFront">
            <small>MADE ESPECIALLY FOR YOU</small>
            <div className="cardsHeroHeart">♥</div>
            <h2>Happy Birthday</h2>
            <p>There are some memories worth keeping forever.</p>

            <div className="cardsSmartMark">
              <strong>SMART MEMORY</strong>
              <span>Tap to hear their message</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cardsOccasionSection">
        <div className="cardsSectionIntro">
          <span className="v14Eyebrow">STEP 1</span>
          <h2>What is the occasion?</h2>
          <p>
            Select an occasion to explore ten different handcrafted
            design directions.
          </p>
        </div>

        <div className="occasionTabs">
          {occasions.map((item) => (
            <button
              key={item}
              type="button"
              className={occasion === item ? 'active' : ''}
              onClick={() => setOccasion(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="cardsGallerySection">
        <div className="cardsGalleryHeading">
          <div>
            <span className="v14Eyebrow">STEP 2</span>
            <h2>{occasion} card designs</h2>
            <p>
              Choose the style you love. Each design can then be personalised
              with names, colours, greetings, photographs and your message.
            </p>
          </div>

          <span className="designCount">10 DESIGNS</span>
        </div>

        <div className="cardDesignGrid">
          {currentDesigns.map((design, index) => (
            <article className="cardDesignItem" key={design.id}>
              <div className={`cardDesignPreview ${design.style}`}>
                <span className="designNumber">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="designArtwork">
                  {design.style === 'floral' && <div className="flowerMark">✿</div>}
                  {design.style === 'classic' && <div className="classicMark">SM</div>}
                  {design.style === 'rustic' && <div className="rusticMark">♥</div>}
                  {design.style === 'minimal' && <div className="minimalMark">— ♥ —</div>}
                  {design.style === 'photo' && <div className="photoMark">YOUR PHOTO</div>}
                  {design.style === 'gold' && <div className="goldMark">✦</div>}
                  {design.style === 'watercolour' && <div className="paintMark">♥</div>}
                  {design.style === 'layered' && <div className="layerMark">♥</div>}
                  {design.style === 'type' && <div className="typeMark">LOVE</div>}
                  {design.style === 'signature' && <div className="signatureMark">For you</div>}

                  <small>{occasion.toUpperCase()}</small>
                  <h3>
                    {occasion === 'Remembrance'
                      ? 'Always remembered'
                      : occasion === 'Thank You'
                        ? 'Thank you'
                        : occasion === 'Wedding'
                          ? 'To a beautiful couple'
                          : occasion === 'New Baby'
                            ? 'Hello little one'
                            : occasion === 'Graduation'
                              ? 'You did it!'
                              : occasion === 'Retirement'
                                ? 'A new chapter'
                                : occasion === "Valentine's"
                                  ? 'For my love'
                                  : `Happy ${occasion}`}
                  </h3>

                  <p>Made especially for you</p>
                </div>

                <div className="smartCorner">
                  <span>♥</span>
                  SMART
                </div>
              </div>

              <div className="cardDesignInfo">
                <span>DESIGN {String(index + 1).padStart(2, '0')}</span>
                <h3>{design.name}</h3>
                <p>{design.description}</p>

                <Link
                  href={`/cards/personalise?occasion=${encodeURIComponent(
                    occasion
                  )}&design=${encodeURIComponent(design.name)}`}
                  className="cardChooseButton"
                >
                  Personalise this design →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cardsSmartSection">
        <div className="cardsSmartCopy">
          <span className="v14Eyebrow light">THE SMART TWIST</span>

          <h2>
            Let the card say something
            <br />
            paper cannot.
          </h2>

          <p>
            Add a Smart Memory to your handcrafted card and the recipient
            can tap their phone to hear your voice, see a special photograph
            and revisit your personal message.
          </p>

          <Link href="/how-it-works" className="btn">
            Discover Smart Memories
          </Link>
        </div>

        <div className="cardsSmartSteps">
          <div>
            <strong>01</strong>
            <span>Open the card</span>
          </div>

          <div>
            <strong>02</strong>
            <span>Tap the hidden NFC point</span>
          </div>

          <div>
            <strong>03</strong>
            <span>Hear the memory</span>
          </div>
        </div>
      </section>

      <section className="cardsBespoke">
        <span className="v14Eyebrow">CAN'T FIND THE RIGHT STYLE?</span>

        <h2>Make it completely bespoke.</h2>

        <p>
          Tell us the occasion, colours, style and story. Smart Memories
          can create a card direction specifically for the person receiving it.
        </p>

        <Link href="/contact" className="btn big">
          Request a Bespoke Card
        </Link>
      </section>
    </>
  );
}