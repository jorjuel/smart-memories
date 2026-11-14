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
        Smart Memories is a UK sole-trader business in pre-launch testing.
        Full trader details and final commercial terms will be published
        before live orders are accepted.
      </p>

      <div className="card">
        <h2>Business identity and contact</h2>
        <p>Smart Memories is the trading name used for this sole-trader business. The trader’s legal name and business contact address will be added here before the business accepts real customer orders. For enquiries in the meantime, please use our contact form.</p>

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
          By submitting photographs, artwork, designs, text, audio or video,
          customers confirm that they own the necessary rights or have obtained
          permission to reproduce and use that content for their order. Permission
          must cover printing on personalised products and, where relevant,
          storing and displaying the content as a digital Smart Memory.
        </p>
        <p>
          Customers authorise Smart Memories to process, reproduce and share
          their submitted content with production partners only as reasonably
          necessary to fulfil their order. Customers must not upload content
          that infringes another person's copyright, trademark, privacy or
          other rights.
        </p>
        <p>
          Smart Memories may review content, request evidence of permission,
          and suspend, refuse or cancel orders containing potentially infringing
          material. A customer declaration does not override the rights of
          copyright owners. Where an order is cancelled, applicable statutory
          refund rights remain unaffected.
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