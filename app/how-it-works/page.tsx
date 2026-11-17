import Link from 'next/link';

const steps = [
  {
    number: '01',
    title:
      'Choose your gift tag',
    text:
      'Pick a Memory Gift Tag design for the gift you’re giving.',
  },

  {
    number: '02',
    title:
      'Add your story',
    text:
      'Add your photographs, personal message, voice recording and video where available.',
  },

  {
    number: '03',
    title:
      'We prepare your tag',
    text:
      'We link the tag to your Smart Memory. Tie it to your gift when it arrives.',
  },

  {
    number: '04',
    title:
      'They tap it',
    text:
      'The recipient simply taps the Smart Memory point with a compatible phone or scans the QR backup.',
  },

  {
    number: '05',
    title:
      'The memory opens',
    text:
      'Their Smart Memory opens in the browser so they can see, hear and relive the moments you created for them.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="howMemoryHero">
        <span className="v14Eyebrow">
          HOW SMART MEMORIES WORKS
        </span>

        <h1>
          From a meaningful gift
          to a memory they can
          relive.
        </h1>

        <p>
          A Memory Gift Tag adds your photos, words and voice to a gift you’ve chosen.
        </p>

        <div className="howMemoryNoApp">
          <strong>
            No app required.
          </strong>

          <span>
            Tap the tag or scan
            its QR code and the
            memory opens in the
            phone browser.
          </span>
        </div>
      </section>

      <section className="howMemorySteps">
        {steps.map(
          (
            step
          ) => (
            <article
              key={
                step.number
              }
            >
              <span>
                {
                  step.number
                }
              </span>

              <h2>
                {
                  step.title
                }
              </h2>

              <p>
                {
                  step.text
                }
              </p>
            </article>
          )
        )}
      </section>

      <section className="howMemoryFinal">
        <span className="v14Eyebrow light">
          TAP. REMEMBER. RELIVE.
        </span>

        <h2>
          Ready to create one?
        </h2>

        <p>
          Start with the story you
          want them to keep.
        </p>

        <Link
          className="btn big"
          href="/tags"
        >
          Create a Memory
        </Link>
      </section>
    </>
  );
}
