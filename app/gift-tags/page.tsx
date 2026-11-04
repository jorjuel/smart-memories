import Link from 'next/link';
import './gift-tags.css';

export const metadata = {
  title: 'Smart Memory Gift Tags | Smart Memories',
  description: 'Attach a personal memory to a gift of your own. Discover standalone tap-to-open Smart Memory gift tags.',
};

const tagOptions = [
  {
    title: 'Everyday Memory Tag',
    description: 'A simple, elegant tag to attach to a present you have chosen.',
    price: '£8.95',
    detail: 'Single tag · proposed price',
    style: 'everyday',
  },
  {
    title: 'Keepsake Memory Tag',
    description: 'A more durable design that is intended to be kept after the gift is opened.',
    price: '£11.95',
    detail: 'Single tag · proposed price',
    style: 'keepsake',
  },
  {
    title: 'Three Memory Tags',
    description: 'Make several birthdays, celebrations or thoughtful gifts more personal.',
    price: 'To be confirmed',
    detail: 'Three-tag bundle · in planning',
    style: 'bundle',
  },
];

export default function MemoryGiftTagsPage() {
  return (
    <main className="smGiftTagPage">
      <section className="smGiftTagHero">
        <div className="smGiftTagHeroCopy">
          <span className="eyebrow">A NEW WAY TO GIVE · CONCEPT PREVIEW</span>
          <h1>A little tag.<br /><em>A lasting memory.</em></h1>
          <p>
            You choose the present. We make it personal. Attach a Smart Memory
            Gift Tag to flowers, a toy, a wrapped gift or something handmade.
            The recipient taps their phone to discover your message.
          </p>
          <div className="smGiftTagHeroActions">
            <a className="btn big" href="#gift-tag-options">Explore the tags</a>
            <Link className="smGiftTagTextLink" href="/how-it-works">How Smart Memories work</Link>
          </div>
          <p className="smGiftTagPrelaunch">Coming soon · Designs and prices are being finalised. Not available to purchase yet.</p>
          <Link className="smGiftTagTextLink" href="/gift-tags/activate">Already purchased a tag? See the activation process</Link>
        </div>
        <div className="smGiftTagHeroArt" role="img" aria-label="Illustration of a ribbon-tied gift with an elegant Smart Memories gift tag">
          <div className="smGiftTagGiftBox"><span /></div>
          <div className="smGiftTagGiftRibbon" />
          <div className="smGiftTagHangingTag">
            <div className="smGiftTagHole" />
            <span className="smGiftTagBrand">SMART MEMORIES</span>
            <span className="smGiftTagHeart" aria-hidden="true">♡</span>
            <strong>Made more personal</strong>
            <small>Tap your phone here</small>
            <span className="smGiftTagTapSymbol" aria-hidden="true">⌁</span>
          </div>
        </div>
      </section>

      <section className="smGiftTagIntro">
        <span className="eyebrow">IT WORKS WITH YOUR GIFT</span>
        <h2>Your gift. Your story. One simple tap.</h2>
        <p>No need to order a whole personalised product. Just add a memory to the present you already love.</p>
      </section>

      <section className="smGiftTagSteps" aria-label="How standalone memory tags will work">
        {[
          ['01', 'Choose your tag', 'Pick a simple gift tag or a longer-lasting keepsake.'],
          ['02', 'Attach it to your present', 'Add the tag to your own wrapped gift, bouquet or keepsake.'],
          ['03', 'Create the memory', 'After activation, add a personal message, photographs and a voice recording.'],
          ['04', 'Give the moment', 'The recipient taps a compatible phone or scans the QR backup to open it.'],
        ].map(([number, title, description]) => (
          <article className="smGiftTagStep" key={number}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </section>

      <section className="smGiftTagCollection" id="gift-tag-options">
        <span className="eyebrow">PLANNED COLLECTION</span>
        <h2>Something small. Something meaningful.</h2>
        <div className="smGiftTagOptions">
          {tagOptions.map((option) => (
            <article className="smGiftTagOption" key={option.title}>
              <div className={`smGiftTagOptionArt smGiftTagOptionArt--${option.style}`}>
                <div className="smGiftTagMiniTag">
                  <span>♡</span>
                  <strong>Smart Memories</strong>
                  <small>Tap to open</small>
                </div>
              </div>
              <div className="smGiftTagOptionCopy">
                <h3>{option.title}</h3>
                <p>{option.description}</p>
                <strong>{option.price}</strong>
                <small>{option.detail}</small>
              </div>
            </article>
          ))}
        </div>
        <p className="smGiftTagPrelaunch">
          Concept illustrations, not photographs of final manufactured products.
          Material, postage, final prices and availability are still to be confirmed.
        </p>
      </section>

      <section className="smGiftTagBottom">
        <span className="eyebrow">THE SMART MEMORY INSIDE</span>
        <h2>It's more than a gift tag.</h2>
        <p>
          A small tag can open a personal message, voice recording and photographs
          stored on a private-to-the-link memory page. NFC requires a compatible
          phone; the QR code offers another way to open the same memory.
        </p>
        <p>
          The buy-first, activate-later system is being built with unique tag
          credentials so an unclaimed tag cannot simply be taken over by someone
          who discovers its public link.
        </p>
        <Link className="btn big" href="/contact">Ask about Memory Gift Tags</Link>
        <Link className="smGiftTagTextLink" href="/shop">Continue shopping</Link>
      </section>
    </main>
  );
}
