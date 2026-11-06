import Link from 'next/link';

const steps = [
  {
    number: '01',
    title: 'Create your Smart Memory',
    text: 'Start with the person and your message. Add a photo, voice recording or video if you wish.',
  },
  {
    number: '02',
    title: 'Save the memory',
    text: 'Your personal memory gets a unique link for sharing and connecting to a gift.',
  },
  {
    number: '03',
    title: 'Choose how to share',
    text: 'Keep it digital for £5, choose a satin-bow gift tag, or add a personalised keepsake.',
  },
  {
    number: '04',
    title: 'They open and relive it',
    text: 'A link, phone tap or QR scan opens the memory in their browser. No app is needed.',
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
          Your memory comes first.
          The gift is your choice.
        </h1>

        <p>
          Create the story you want them to keep,
          then share it digitally or attach it to a personalised gift.
        </p>

        <div className="howMemoryNoApp">
          <strong>
            No app required.
          </strong>

          <span>
            Tap the gift or scan
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
          href="/create"
        >
          Create a Memory
        </Link>
      </section>
    </>
  );
}