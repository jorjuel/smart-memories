import Link from 'next/link';
import CardGalleryFront from '../../components/CardGalleryFront';
import { cardDesigns } from '../../lib/cardDesigns';
import { CARD_PRICES_PENCE } from '../../lib/pricing';

const cardPrice = `£${(CARD_PRICES_PENCE.traditional / 100).toFixed(2)}`;

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ cardType?: string; occasion?: string }>;
}) {
  const { cardType, occasion } = await searchParams;
  const options = {
    ...(cardType === 'smart' || cardType === 'traditional' ? { cardType } : {}),
    ...(typeof occasion === 'string' && occasion ? { occasion } : {}),
  };

  return (
    <>
      <section className="cardsGallerySection smCardBoutique">
        <div className="cardsGalleryHeading">
          <div>
            <span className="v14Eyebrow">HANDCRAFTED CARDS</span>
            <h1>Find a card that feels like them.</h1>
            <p>Pick a design you love, then make it yours with your own words or photo. Add a Smart Memory if you’d like them to hear or see more.</p>
          </div>
        </div>

        <div className="cardDesignGrid">
          {cardDesigns.map((design) => (
            <article className="cardDesignItem" key={design.name}>
              <CardGalleryFront design={design.name} photoSlug={design.photoSlug} />
              <div className="cardDesignInfo">
                <h2>{design.name}</h2>
                <p>{design.description}</p>
                <strong>From {cardPrice}</strong>
                <Link href={{ pathname: '/cards/personalise', query: { ...options, design: design.name } }} className="cardChooseButton">
                  Personalise this card
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="smCardOwnDesign">
          <div>
            <h2>Have your own artwork?</h2>
            <p>Upload a JPG, PNG or WebP for the front of your card.</p>
          </div>
          <Link href={{ pathname: '/cards/personalise', query: { ...options, design: 'Your Own Design' } }} className="cardChooseButton">Use my own design</Link>
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
