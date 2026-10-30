'use client';

import {
  Suspense,
  useState,
} from 'react';

import {
  useSearchParams,
} from 'next/navigation';

const corporateOptions = [
  'Employee Welcome Pack',
  'Thank You Pack',
  'Event Gift Pack',
  'Premium Client Pack',
  'Recognition Pack',
  'Custom Corporate Bundle',
];

function ContactContent() {
  const searchParams =
    useSearchParams();

  const type =
    searchParams.get('type');

  const bundleFromUrl =
    searchParams.get('bundle') ||
    '';

  const isCorporate =
    type === 'corporate';

  const [
    companyName,
    setCompanyName,
  ] = useState('');

  const [
    contactName,
    setContactName,
  ] = useState('');

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    phone,
    setPhone,
  ] = useState('');

  const [
    quantity,
    setQuantity,
  ] = useState('');

  const [
    bundle,
    setBundle,
  ] = useState(
    bundleFromUrl
  );

  const [
    budget,
    setBudget,
  ] = useState('');

  const [
    requiredDate,
    setRequiredDate,
  ] = useState('');

  const [
    branding,
    setBranding,
  ] = useState('');

  const [
    message,
    setMessage,
  ] = useState('');

  function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    alert(
      'Thank you. Your corporate enquiry has been captured. We will connect this form to email or Supabase next.'
    );
  }

  return (
    <section className="wrap">
      <span className="eyebrow">
        {isCorporate
          ? 'CORPORATE GIFTING'
          : 'CONTACT SMART MEMORIES'}
      </span>

      <h1>
        {isCorporate
          ? 'Request a corporate quote'
          : 'Talk to us'}
      </h1>

      <p className="lead">
        {isCorporate
          ? 'Tell us about your team, event or client gifting requirements and we’ll prepare a personalised quote.'
          : 'Have a question about Smart Memories, personalised gifts or a special order? Send us a message.'}
      </p>

      {isCorporate ? (
        <form
          onSubmit={
            handleSubmit
          }
          className="card"
          style={{
            maxWidth:
              '760px',
          }}
        >
          <div className="personaliserSection">
            <h2>
              Company details
            </h2>

            <label>
              Company name
            </label>

            <input
              type="text"
              value={
                companyName
              }
              onChange={(
                event
              ) =>
                setCompanyName(
                  event
                    .target
                    .value
                )
              }
              required
            />

            <label>
              Contact name
            </label>

            <input
              type="text"
              value={
                contactName
              }
              onChange={(
                event
              ) =>
                setContactName(
                  event
                    .target
                    .value
                )
              }
              required
            />

            <label>
              Email
            </label>

            <input
              type="email"
              value={
                email
              }
              onChange={(
                event
              ) =>
                setEmail(
                  event
                    .target
                    .value
                )
              }
              required
            />

            <label>
              Phone
            </label>

            <input
              type="tel"
              value={
                phone
              }
              onChange={(
                event
              ) =>
                setPhone(
                  event
                    .target
                    .value
                )
              }
            />
          </div>

          <div className="personaliserSection">
            <h2>
              Order requirements
            </h2>

            <label>
              Corporate bundle or product
            </label>

            <select
              value={
                bundle
              }
              onChange={(
                event
              ) =>
                setBundle(
                  event
                    .target
                    .value
                )
              }
            >
              <option value="">
                Choose an option
              </option>

              {corporateOptions.map(
                (
                  option
                ) => (
                  <option
                    key={
                      option
                    }
                    value={
                      option
                    }
                  >
                    {
                      option
                    }
                  </option>
                )
              )}
            </select>

            <label>
              Approximate quantity
            </label>

            <input
              type="number"
              min="1"
              value={
                quantity
              }
              onChange={(
                event
              ) =>
                setQuantity(
                  event
                    .target
                    .value
                )
              }
              placeholder="e.g. 50"
            />

            <label>
              Approximate budget
            </label>

            <input
              type="text"
              value={
                budget
              }
              onChange={(
                event
              ) =>
                setBudget(
                  event
                    .target
                    .value
                )
              }
              placeholder="e.g. £500 or £15 per pack"
            />

            <label>
              Required by
            </label>

            <input
              type="date"
              value={
                requiredDate
              }
              onChange={(
                event
              ) =>
                setRequiredDate(
                  event
                    .target
                    .value
                )
              }
            />
          </div>

          <div className="personaliserSection">
            <h2>
              Branding & personalisation
            </h2>

            <label>
              Branding requirements
            </label>

            <textarea
              rows={4}
              value={
                branding
              }
              onChange={(
                event
              ) =>
                setBranding(
                  event
                    .target
                    .value
                )
              }
              placeholder="Logo, company colors, names, event branding, packaging..."
            />

            <label>
              Tell us more
            </label>

            <textarea
              rows={5}
              value={
                message
              }
              onChange={(
                event
              ) =>
                setMessage(
                  event
                    .target
                    .value
                )
              }
              placeholder="Tell us about the event, recipients, delivery location or any other requirements."
            />
          </div>

          <button
            type="submit"
            className="btn big"
          >
            Request Corporate Quote
          </button>
        </form>
      ) : (
        <div
          className="card"
          style={{
            maxWidth:
              '720px',
          }}
        >
          <h2>
            How can we help?
          </h2>

          <p>
            For general questions, personalised orders or support, please use this contact page.
          </p>

          <p>
            For business orders, branded products and larger quantities, choose Corporate Gifting from the Shop.
          </p>
        </div>
      )}
    </section>
  );
}

function ContactLoading() {
  return (
    <section className="wrap">
      <span className="eyebrow">
        SMART MEMORIES
      </span>

      <h1>
        Contact
      </h1>

      <p className="lead">
        Loading contact options...
      </p>
    </section>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <ContactLoading />
      }
    >
      <ContactContent />
    </Suspense>
  );
}