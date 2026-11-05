import Link from 'next/link';

/* Previous occasion links now live in the shop; the memory flow starts with two clear choices. */
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

      <section className="smMemoryPathSection" aria-labelledby="memory-path-title">
        <span className="v14Eyebrow">CHOOSE HOW YOUR MEMORY IS PRESENTED</span>
        <h2 id="memory-path-title">How would you like to share your memory?</h2>
        <p>Both choices use the same photo, voice and message creator. Make your memory first, then choose how it is presented.</p>
        <div className="smMemoryPathGrid">
          <Link href="/create?mode=tag" className="smMemoryPathCard">
            <span className="smMemoryPathIcon" aria-hidden="true">🎀</span>
            <h3>Memory Only</h3>
            <p>Create your digital memory, then choose a satin bow colour for a decorative gift tag that opens the memory.</p>
            <strong>Create memory &amp; tag →</strong>
          </Link>
          <Link href="/create?mode=gift" className="smMemoryPathCard">
            <span className="smMemoryPathIcon" aria-hidden="true">🎁</span>
            <h3>Memory + Gift</h3>
            <p>Create your digital memory first, then choose a personalised gift to carry it.</p>
            <strong>Create memory &amp; choose gift →</strong>
          </Link>
        </div>
      </section>
    </>
  );
}
