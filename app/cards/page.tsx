import Link from 'next/link';
import CardGalleryFront from '../../components/CardGalleryFront';
import { defaultCatalogueCards } from '../../lib/cardDesigns';
import { loadCardCatalogue } from '../../lib/cardCatalogueServer';
import { getCardPricePence } from '../../lib/pricing';
import DeliverySummary from '@/components/DeliverySummary';

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ cardType?: string; occasion?: string }>;
}) {
  const { cardType, occasion } = await searchParams;
  const cardDesigns = await loadCardCatalogue().catch(() => defaultCatalogueCards);
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

        <div className="smCardTypeComparison" aria-label="Compare card types">
          <article className="card"><h2>Traditional card</h2><p>A handmade card with your printed wording. A printed photo is available as an optional extra.</p></article>
          <article className="card"><h2>Smart Memory card</h2><p>A handmade card with your printed wording, plus a digital memory that opens by tap or QR scan. Add a message, photo, voice recording or video. Voice is optional.</p><Link href="/m/sample">Try a sample memory</Link></article>
        </div>
        <DeliverySummary />
        <div className="cardDesignGrid">
          {cardDesigns.map((design) => (
            <article className="cardDesignItem" key={design.name}>
              <CardGalleryFront design={design.name} photoSlug={design.photoSlug} />
              <div className="cardDesignInfo">
                <h2>{design.name}</h2>
                <p>{design.description}</p>
                <strong>From £{(getCardPricePence(cardType === 'smart' ? 'smart' : 'traditional', false, design.basePricePence) / 100).toFixed(2)}</strong>
                <Link href={{ pathname: '/cards/personalise', query: { ...options, design: design.name, card: design.photoSlug } }} className="cardChooseButton">
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
