import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <section className="wrap">
      <span className="eyebrow">
        OWNER DASHBOARD
      </span>

      <h1>
        Smart Memories Admin
      </h1>

      <p className="lead">
        Manage customer orders,
        memories, corporate enquiries
        and completed work.
      </p>

      <div className="products">
        <article className="card">
          <span className="eyebrow">
            ACTIVE
          </span>

          <h2>
            Orders
          </h2>

          <p>
            View orders waiting to
            be produced.
          </p>

          <Link
            href="/admin/orders"
            className="btn"
          >
            View orders
          </Link>
        </article>

        <article className="card">
          <span className="eyebrow">
            DIGITAL
          </span>

          <h2>
            Memories
          </h2>

          <p>
            View Smart Memory codes,
            photos and recordings.
          </p>

          <Link
            href="/admin/memories"
            className="btn"
          >
            View memories
          </Link>
        </article>

        <article className="card">
          <span className="eyebrow">
            BUSINESS
          </span>

          <h2>
            Corporate Enquiries
          </h2>

          <p>
            Manage business and bulk
            order requests.
          </p>

          <Link
            href="/admin/corporate"
            className="btn"
          >
            View enquiries
          </Link>
        </article>

        <article className="card">
          <span className="eyebrow">
            ARCHIVE
          </span>

          <h2>
            Completed
          </h2>

          <p>
            Finished orders moved out
            of the active production list.
          </p>

          <Link
            href="/admin/completed"
            className="btn"
          >
            View completed
          </Link>
        </article>
      </div>
    </section>
  );
}