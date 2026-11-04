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
    description: 'Soft flowers and elegant handmade detailing.',
  },
  {
    name: 'Classic Elegance',
    style: 'classic',
    description: 'Traditional, timeless and beautifully understated.',
  },
  {
    name: 'Modern Minimal',
    style: 'minimal',
    description: 'Clean typography, modern layout and a personal touch.',
  },
  {
    name: 'Photo Feature',
    style: 'photo',
    description: 'Make a favourite picture the centre of the card.',
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
            Made by hand.
            <br />
            Remembered with a tap.
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
            Choose from four easy styles, or upload your own card artwork.
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
              Four thoughtfully chosen looks, plus the freedom to upload your own artwork.
              Every card can be traditional or include an NFC Smart Memory.
            </p>
          </div>

          <span className="designCount">4 STYLES + YOUR DESIGN</span>
        </div>

        <div className="cardDesignGrid">
          {currentDesigns.map((design, index) => (
            <article className="cardDesignItem" key={design.id}>
              <div className={`cardDesignPreview ${design.style}`}>
                <span className="designNumber">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="designArtwork">
                  {design.style === 'floral' && (
                    <div className="smCardFloralArrangement" aria-hidden="true">
                      <span className="smCardRose smCardRoseOne" />
                      <span className="smCardRose smCardRoseTwo" />
                      <span className="smCardRose smCardRoseThree" />
                      <span className="smCardLeaf smCardLeafOne" />
                      <span className="smCardLeaf smCardLeafTwo" />
                      <span className="smCardLeaf smCardLeafThree" />
                      <span className="smCardBlossom smCardBlossomOne" />
                      <span className="smCardBlossom smCardBlossomTwo" />
                    </div>
                  )}
                  {design.style === 'classic' && (
                    <div className="smCardClassicCrest" aria-hidden="true">SM</div>
                  )}
                  {design.style === 'minimal' && (
                    <div className="smCardMinimalRule" aria-hidden="true"><span />♥<span /></div>
                  )}
                  {design.style === 'photo' && (
                    <div className="smCardPhotoSample" aria-hidden="true">
                      <span className="smCardPhotoHorizon" />
                      <span className="smCardPhotoSun" />
                      <span className="smCardPhotoMountain smCardPhotoMountainOne" />
                      <span className="smCardPhotoMountain smCardPhotoMountainTwo" />
                    </div>
                  )}

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
                  Choose this design →
                </Link>
              </div>
            </article>
          ))}
          <article className="cardDesignItem smOwnCardDesign">
            <div className="cardDesignPreview smOwnCardDesignPreview">
              <div className="designArtwork">
                <div className="smOwnCardUploadIcon" aria-hidden="true">＋</div>
                <small>YOUR ARTWORK</small>
                <h3>Designed by you</h3>
                <p>Upload a JPG, PNG or WebP image</p>
              </div>
            </div>
            <div className="cardDesignInfo">
              <span>YOUR OWN DESIGN</span>
              <h3>Upload your own artwork</h3>
              <p>Already created a design? Upload the front of your card, then add your message and choose traditional or NFC.</p>
              <Link
                href={`/cards/personalise?occasion=${encodeURIComponent(occasion)}&design=Your%20Own%20Design`}
                className="cardChooseButton"
              >
                Use my own design →
              </Link>
            </div>
          </article>
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