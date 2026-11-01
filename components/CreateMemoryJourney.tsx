import Link from 'next/link';

const memoryChoices = [
  {
    symbol: '♥',
    title: 'Love & Couples',
    text:
      'Celebrate your story together, from weddings to anniversaries and everything between.',
    href: '/shop?occasion=Anniversary',
  },
  {
    symbol: 'R',
    title: 'Remember Someone',
    text:
      'Create something meaningful that keeps their photograph, words and voice close.',
    href: '/shop?occasion=Remembrance',
  },
  {
    symbol: 'P',
    title: 'Pet Memory',
    text:
      'Preserve the photographs and little moments that captured their personality.',
    href: '/shop?occasion=Pet%20Memory',
  },
  {
    symbol: 'B',
    title: 'Baby Memory',
    text:
      'Save the beginnings, first moments and messages you never want to forget.',
    href: '/shop?occasion=New%20Baby',
  },
  {
    symbol: 'F',
    title: 'Family Memory',
    text:
      'Bring photographs, messages and family voices together in one place.',
    href: '/shop?occasion=Family%20Memory',
  },
  {
    symbol: 'C',
    title: 'Celebration',
    text:
      'Make birthdays, graduations and important milestones more personal.',
    href: '/shop?occasion=Birthday',
  },
];

export default function CreateMemoryJourney() {
  return (
    <>
      <section className="createMemoryHero">
        <span className="v14Eyebrow">
          CREATE A SMART MEMORY
        </span>

        <h1>
          Start with the person, moment or story you want to preserve.
        </h1>

        <p>
          You do not need to choose the product first. Think about what
          you want them to see, hear and remember.
        </p>

        <div className="createMemoryBrandLine">
          Tap.
          <span>Remember.</span>
          Relive.
        </div>
      </section>

      <section className="createMemoryChoices">
        <div className="createMemoryChoiceGrid">
          {memoryChoices.map((choice) => (
            <Link
              key={choice.title}
              href={choice.href}
              className="createMemoryChoice"
            >
              <div className="createMemoryChoiceSymbol">
                {choice.symbol}
              </div>

              <h2>{choice.title}</h2>

              <p>{choice.text}</p>

              <strong>
                Begin this memory →
              </strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="createMemoryGuide">
        <div>
          <span className="v14Eyebrow light">
            HOW IT COMES TO LIFE
          </span>

          <h2>
            Your story first.
            <br />
            The gift comes next.
          </h2>

          <p>
            Choose the kind of memory you are creating, select a physical
            gift, then personalise it with your photograph, words and voice.
          </p>

          <Link
            href="/how-it-works"
            className="createMemoryGuideLink"
          >
            See How It Works →
          </Link>
        </div>

        <div className="createMemoryMiniSteps">
          <article>
            <span>01</span>
            <strong>Choose the story</strong>
          </article>

          <article>
            <span>02</span>
            <strong>Choose the gift</strong>
          </article>

          <article>
            <span>03</span>
            <strong>Add photos, words and voice</strong>
          </article>

          <article>
            <span>04</span>
            <strong>They tap and relive it</strong>
          </article>
        </div>
      </section>

      <section className="createMemoryDirect">
        <span className="v14Eyebrow">
          ALREADY KNOW WHAT YOU NEED?
        </span>

        <h2>
          Choose how you want to begin.
        </h2>

        <div className="actions">
          <Link
            href="/shop"
            className="btn big"
          >
            Browse All Smart Gifts
          </Link>

          <Link
            href="/create?direct=1"
            className="createMemoryDirectLink"
          >
            Create a standalone digital memory →
          </Link>
        </div>
      </section>
    </>
  );
}