import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <section className="narrow infoPage">
      <span className="v14Eyebrow">
        SMART MEMORIES
      </span>

      <h1>
        Privacy Policy
      </h1>

      <p className="lead">
        Your memories are personal.
        We believe the way we handle
        your information should be
        clear too.
      </p>

      <div className="card">
        <h2>Who is responsible for your data?</h2>
        <p>Smart Memories is operated as a UK sole-trader business. The final data controller identity and direct contact details are being confirmed for launch. This page is not yet a complete UK GDPR privacy notice.</p>

        <h2>
          Information you provide
        </h2>

        <p>
          Smart Memories may process
          information you provide
          when creating an account,
          placing an order or
          creating a Smart Memory,
          including contact details,
          photographs, messages and
          uploaded or recorded media.
        </p>

        <h2>
          Why we use it
        </h2>

        <p>
          This information is used
          to provide the Smart
          Memories service, fulfil
          orders and make the memory
          experience available to
          you and the people with
          whom you choose to share
          it.
        </p>

        <h2>
          Your choices
        </h2>

        <p>
          Additional privacy,
          retention and deletion
          controls will continue to
          be developed as Smart
          Memories moves toward
          public launch.
        </p>

        <p>
          This page is general
          product information and
          should be reviewed and
          expanded into the final
          legal privacy notice before
          commercial launch.
        </p>
      </div>

      <div className="actions">
        <Link
          href="/contact"
          className="btn"
        >
          Contact Smart Memories
        </Link>
      </div>
    </section>
  );
}