import Link from 'next/link';

export default function TermsPage() {
  return (
    <section className="narrow infoPage">
      <span className="v14Eyebrow">
        SMART MEMORIES
      </span>

      <h1>
        Terms
      </h1>

      <p className="lead">
        These terms are being
        prepared for the commercial
        launch of Smart Memories.
      </p>

      <div className="card">
        <h2>
          Personalised products
        </h2>

        <p>
          Smart Memories products
          may be created using
          photographs, wording and
          media supplied by the
          customer.
        </p>

        <h2>
          Customer content
        </h2>

        <p>
          Customers should only
          upload photographs,
          recordings and other
          content that they are
          entitled to use.
        </p>

        <h2>
          Smart Memory access
        </h2>

        <p>
          Smart Memory links are
          designed to connect a
          physical gift with its
          associated digital memory
          experience.
        </p>

        <p>
          Full commercial terms,
          including payment,
          delivery, cancellation,
          personalised-product
          returns and service
          availability, should be
          legally reviewed and
          published before public
          launch.
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