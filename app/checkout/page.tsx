'use client';

import PersonalisedProductPreview from '../../components/PersonalisedProductPreview';
import type { SavedCardPreview } from '../../lib/cardDesigns';
import Link from 'next/link';
import { getCartShippingPricePence, singleMemoryTagLetterCart } from '@/lib/shippingPricing';
import { useSearchParams } from 'next/navigation';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';


type BasketItem = {
  id: string;
  personalisationId?: string;
  memoryCode?: string;
  productType:
    | 'smart-card'
    | 'traditional-card'
    | 'product'
    | 'bundle';
  productSlug?: string;
  name: string;
  occasion?: string;
  design?: string;
  recipient?: string;
  imageUrl?: string | null;
  cardPreview?: SavedCardPreview;
  audioUrl?: string | null;
  price: number;
  quantity: number;
  personalisation?: unknown;
};

const CART_KEY =
  'smart-memories-cart';

const IDEMPOTENCY_KEY =
  'smart-memories-checkout-idempotency';

export default function CheckoutPage() {
    const searchParams = useSearchParams();

  const paymentStatus =
    searchParams.get('payment');

  const sessionId =
    searchParams.get('session_id');

  const [verificationStatus, setVerificationStatus] = useState<'checking'|'paid'|'pending'|'error'>('checking');
  const paymentSuccessful = paymentStatus === 'success' && verificationStatus === 'paid';
  const [
    items,
    setItems,
  ] = useState<BasketItem[]>([]);

  const [
    loaded,
    setLoaded,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    orderError,
    setOrderError,
  ] = useState('');

  const [
    orderNumber,
    setOrderNumber,
  ] = useState('');

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    firstName,
    setFirstName,
  ] = useState('');

  const [
    lastName,
    setLastName,
  ] = useState('');

  const [
    phone,
    setPhone,
  ] = useState('');

  const [
    address1,
    setAddress1,
  ] = useState('');

  const [
    address2,
    setAddress2,
  ] = useState('');

  const [
    town,
    setTown,
  ] = useState('');

  const [
    county,
    setCounty,
  ] = useState('');

  const [
    postcode,
    setPostcode,
  ] = useState('');

  const [
    deliveryMethod,
    setDeliveryMethod,
  ] = useState<
    'standard' | 'express'
  >('standard');

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          CART_KEY
        );

      if (saved) {
        const parsed =
          JSON.parse(saved);

        if (
          Array.isArray(parsed)
        ) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error(
        'Could not load basket',
        error
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (paymentStatus !== 'success' || !sessionId) return;
    let active = true;
    fetch(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`, {
      cache: 'no-store',
    }).then(async response => {
      const result = await response.json();
      if (!active) return;
      setVerificationStatus(response.ok
        ? (result.status === 'paid' ? 'paid' : 'pending')
        : 'error');
    }).catch(() => { if (active) setVerificationStatus('error'); });
    return () => {active = false;};
  }, [paymentStatus, sessionId]);

  useEffect(() => {
    if (!paymentSuccessful) {
      return;
    }

    localStorage.removeItem(CART_KEY);

    sessionStorage.removeItem(
      IDEMPOTENCY_KEY
    );

    setItems([]);
  }, [paymentSuccessful]);
  const subtotal =
    useMemo(
      () =>
        items.reduce(
          (
            total,
            item
          ) =>
            total +
            item.price *
              item.quantity,
          0
        ),
      [items]
    );

  const digitalOnly = items.length > 0 && items.every(item => item.productType === 'product' && item.productSlug === 'digital-memory');
  const envelopeTagOnly = singleMemoryTagLetterCart(items);
  const delivery = getCartShippingPricePence(items, deliveryMethod) / 100;

  const total =
    subtotal + delivery;

  const customerName =
    `${firstName} ${lastName}`
      .trim();

  const formReady =
    email.trim() &&
    firstName.trim() &&
    lastName.trim() &&
    (digitalOnly || (address1.trim() && town.trim() && postcode.trim()));

  async function createOrder() {
    if (!formReady) {
      setOrderError(
        digitalOnly ? 'Please complete your name and email.' : 'Please complete your name, email and delivery address.'
      );

      return;
    }

    setSubmitting(true);
    setOrderError('');

    try {
      let idempotencyKey =
        sessionStorage.getItem(
          IDEMPOTENCY_KEY
        );

      if (!idempotencyKey) {
        idempotencyKey =
          crypto.randomUUID();

        sessionStorage.setItem(
          IDEMPOTENCY_KEY,
          idempotencyKey
        );
      }

      const response =
        await fetch(
          '/api/orders',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              cart: items,

              idempotencyKey,

              email:
                email
                  .trim()
                  .toLowerCase(),

              customerName,

              phone:
                phone.trim(),

              deliveryName:
                customerName,

              address1:
                address1.trim(),

              address2:
                address2.trim(),

              city:
                town.trim(),

              county:
                county.trim(),

              postcode:
                postcode
                  .trim()
                  .toUpperCase(),

              deliveryMethod,

              deliveryPrice:
                delivery,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Could not create the order.'
        );
      }

      if (!result.orderId) {
        throw new Error(
          'Order reference was not returned.'
        );
      }

      const paymentResponse =
        await fetch(
          '/api/stripe/checkout',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              orderId:
                result.orderId,

              idempotencyKey,
            }),
          }
        );

      const paymentResult =
        await paymentResponse.json();

      if (
        !paymentResponse.ok ||
        !paymentResult.url
      ) {
        throw new Error(
          paymentResult.error ||
            'Could not start secure payment.'
        );
      }

      window.location.assign(
        paymentResult.url
      );
    } catch (error) {
      console.error(
        'CHECKOUT ORDER ERROR:',
        error
      );

      setOrderError(
        error instanceof Error
          ? error.message
          : 'Could not create your order.'
      );
    } finally {
      setSubmitting(false);
    }
  }
    if (paymentStatus === 'success' && !paymentSuccessful) {
      return (
        <section className="narrow">
          <span className="v14Eyebrow">SECURE PAYMENT</span>
          <h1>{verificationStatus === 'checking' ? 'Checking your payment…' : 'Your payment is being verified'}</h1>
          <div className="card">
            <p>
              {verificationStatus === 'pending'
                ? 'Stripe has not yet confirmed a completed payment. Your order is not marked as paid.'
                : verificationStatus === 'error'
                ? 'We could not verify your Stripe payment just now. Do not pay twice until you have checked your Stripe receipt or order status.'
                : 'We are checking the payment directly with Stripe.'}
            </p>
            <div className="actions">
              <button className="btn" type="button" onClick={() => window.location.reload()}>
                Check payment again
              </button>
              <Link href="/account/orders" className="btn secondary">My Orders</Link>
            </div>
          </div>
        </section>
      );
    }

    if (paymentSuccessful) {
    return (
      <section className="narrow">
        <span className="v14Eyebrow">
          PAYMENT SUCCESSFUL
        </span>

        <h1>
          Thank you for your order.
        </h1>

        <div className="card">
          <h2>
            Your Smart Memories order is confirmed.
          </h2>

          <p>
            Your payment was successful and your order
            is now being prepared.
          </p>

          <p>
            You can view your order details and status
            from your account.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginTop: '20px',
            }}
          >
            <Link
              href="/account/orders"
              className="btn"
            >
              View My Orders
            </Link>

            <Link
              href="/shop"
              className="btn secondary"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!loaded) {
    return (
      <section className="narrow">
        <h1>
          Checkout
        </h1>

        <p>
          Loading your order...
        </p>
      </section>
    );
  }

  /*
   * ORDER CREATED
   */
  if (orderNumber) {
    return (
      <section className="narrow">
        <span className="v14Eyebrow">
          ORDER RECEIVED
        </span>

        <h1>
          Thank you.
        </h1>

        <div className="card">
          <h2>
            Your order has been created.
          </h2>

          <p>
            Your order number is:
          </p>

          <p
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
            }}
          >
            {orderNumber}
          </p>

          <p>
            Payment is currently
            marked as pending because
            Stripe has not yet been
            connected.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginTop: '20px',
            }}
          >
            <Link
              href="/account/orders"
              className="btn"
            >
              My Orders
            </Link>

            <Link
              href="/shop"
              className="btn secondary"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (
    items.length === 0
  ) {
    return (
      <section className="narrow">
        <h1>
          Checkout
        </h1>

        <div className="card empty">
          <h2>
            Your basket is empty.
          </h2>

          <p>
            Add a personalised
            Smart Memories gift
            before continuing to
            checkout.
          </p>

          <Link
            className="btn"
            href="/shop"
          >
            Browse gifts
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="checkoutPage">
      <div className="checkoutHeader">
        <span className="v14Eyebrow">
          SECURE CHECKOUT
        </span>

        <h1>
          Almost ready to make it special.
        </h1>

        <p>
          Confirm your details and
          delivery information before
          creating your order.
        </p>
      </div>

      <div className="checkoutLayout">
        <div className="checkoutMain">
          <section className="checkoutCard">
            <div className="checkoutSectionHeading">
              <span>
                01
              </span>

              <div>
                <h2>
                  Contact details
                </h2>

                <p>
                  We'll use these
                  details for your
                  order confirmation.
                </p>
              </div>
            </div>

            <div className="checkoutFieldGrid">
              <label>
                <span>
                  Email address
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(
                    e
                  ) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                <span>
                  Phone number
                </span>

                <input
                  type="tel"
                  value={phone}
                  onChange={(
                    e
                  ) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  placeholder="Optional"
                />
              </label>

              <label>
                <span>
                  First name
                </span>

                <input
                  value={
                    firstName
                  }
                  onChange={(
                    e
                  ) =>
                    setFirstName(
                      e.target.value
                    )
                  }
                  required
                />
              </label>

              <label>
                <span>
                  Last name
                </span>

                <input
                  value={
                    lastName
                  }
                  onChange={(
                    e
                  ) =>
                    setLastName(
                      e.target.value
                    )
                  }
                  required
                />
              </label>
            </div>
          </section>

          {!digitalOnly &&           <section className="checkoutCard">
            <div className="checkoutSectionHeading">
              <span>
                02
              </span>

              <div>
                <h2>
                  Delivery address
                </h2>

                <p>
                  Where should we
                  send your
                  personalised gift?
                </p>
              </div>
            </div>

            <div className="checkoutFieldGrid">
              <label className="checkoutFull">
                <span>
                  Address line 1
                </span>

                <input
                  value={
                    address1
                  }
                  onChange={(
                    e
                  ) =>
                    setAddress1(
                      e.target.value
                    )
                  }
                  required
                />
              </label>

              <label className="checkoutFull">
                <span>
                  Address line 2
                </span>

                <input
                  value={
                    address2
                  }
                  onChange={(
                    e
                  ) =>
                    setAddress2(
                      e.target.value
                    )
                  }
                  placeholder="Optional"
                />
              </label>

              <label>
                <span>
                  Town / City
                </span>

                <input
                  value={town}
                  onChange={(
                    e
                  ) =>
                    setTown(
                      e.target.value
                    )
                  }
                  required
                />
              </label>

              <label>
                <span>
                  County
                </span>

                <input
                  value={county}
                  onChange={(
                    e
                  ) =>
                    setCounty(
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Postcode
                </span>

                <input
                  value={
                    postcode
                  }
                  onChange={(
                    e
                  ) =>
                    setPostcode(
                      e.target.value
                    )
                  }
                  required
                />
              </label>
            </div>
          </section>}

          {!digitalOnly &&           <section className="checkoutCard">
            <div className="checkoutSectionHeading">
              <span>
                03
              </span>

              <div>
                <h2>
                  Delivery method
                </h2>

                <p>
                  Choose how quickly
                  you'd like your
                  order delivered.
                </p>
              </div>
            </div>

            <div className="deliveryChoices">
              <button
                type="button"
                className={
                  deliveryMethod ===
                  'standard'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setDeliveryMethod(
                    'standard'
                  )
                }
              >
                <div>
                  <strong>
                    {envelopeTagOnly ? 'Royal Mail 2nd Class Large Letter' : 'Standard delivery'}
                  </strong>

                  <span>
                    {envelopeTagOnly ? 'For one packed gift tag, under 100g and within 25mm thick' : 'Delivery estimate depends on the item and destination'}
                  </span>
                </div>

                <b>
                  £{(getCartShippingPricePence(items, 'standard') / 100).toFixed(2)}
                </b>
              </button>

              <button
                type="button"
                className={
                  deliveryMethod ===
                  'express'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setDeliveryMethod(
                    'express'
                  )
                }
              >
                <div>
                  <strong>
                    {envelopeTagOnly ? 'Royal Mail 1st Class Large Letter' : 'Express delivery'}
                  </strong>

                  <span>
                    {envelopeTagOnly ? 'Online postage. Next working day aim, not guaranteed' : 'Priority delivery service after production'}
                  </span>
                </div>

                <b>
                  £{(getCartShippingPricePence(items, 'express') / 100).toFixed(2)}
                </b>
              </button>
            </div>
            <p className="smDeliveryEstimateNote">
              Personalised gifts are made to order. Delivery speed applies
              after production, and a delivery date is not guaranteed.
              {envelopeTagOnly && ' Large Letter pricing assumes the finished bow and envelope fit Royal Mail’s 100g / 25mm limit.'}
              <Link href="/delivery"> Read delivery information</Link>.
            </p>
          </section>}

          <section className="checkoutCard paymentPlaceholder">
            <div className="checkoutSectionHeading">
              <span>
                04
              </span>

              <div>
                <h2>
                  Payment
                </h2>

                <p>
                  Continue to Stripe for
                  secure payment.
                </p>
              </div>
            </div>

            <div className="paymentPreview">
              <strong>
                Secure Stripe checkout
              </strong>

              <p>
                Your order is created first, then you continue
                to Stripe to pay. Payment is only marked as paid
                after Stripe confirms it.
              </p>
            </div>
          </section>
        </div>

        <aside className="checkoutSummary">
          <div className="checkoutSummarySticky">
            <span className="v14Eyebrow">
              YOUR ORDER
            </span>

            <h2>
              Order summary
            </h2>

            <div className="checkoutProducts">
              {items.map(
                (
                  item
                ) => (
                  <div
                    className="checkoutProduct"
                    key={
                      item.id
                    }
                  >
                    <div className="checkoutProductImage">
                      <PersonalisedProductPreview
                        productType={
                          item.productType
                        }
                        productSlug={
                          item.productSlug
                        }
                        imageUrl={
                          item.imageUrl
                        }
                        name={
                          item.name
                        }
                        recipient={
                          item.recipient
                        }
                        design={item.design}
                        cardPreview={item.cardPreview}
                      />
                    </div>

                    <div>
                      <strong>
                        {
                          item.name
                        }
                      </strong>

                      {item.recipient && (
                        <span>
                          For{' '}
                          {
                            item.recipient
                          }
                        </span>
                      )}

                      <small>
                        Qty{' '}
                        {
                          item.quantity
                        }
                      </small>
                    </div>

                    <b>
                      £
                      {(
                        item.price *
                        item.quantity
                      ).toFixed(
                        2
                      )}
                    </b>
                  </div>
                )
              )}
            </div>

            <div className="checkoutTotals">
              <div>
                <span>
                  Subtotal
                </span>

                <strong>
                  £
                  {subtotal.toFixed(
                    2
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Delivery
                </span>

                <strong>
                  £
                  {delivery.toFixed(
                    2
                  )}
                </strong>
              </div>

              <div className="checkoutGrandTotal">
                <span>
                  Total
                </span>

                <strong>
                  £
                  {total.toFixed(
                    2
                  )}
                </strong>
              </div>
            </div>

            <div className="smCheckoutFinalPayment" id="checkout-payment-action" aria-label="Complete secure payment">
            {orderError && (
              <div
                style={{
                  marginBottom:
                    '14px',
                  padding:
                    '12px',
                  border:
                    '1px solid #d9a3a3',
                  borderRadius:
                    '12px',
                }}
              >
                {orderError}
              </div>
            )}

            <button
              type="button"
              className="personaliseBasketButton"
              disabled={
                submitting
              }
              onClick={
                createOrder
              }
            >
              {submitting
                ? 'Creating order...'
                : 'Continue to secure payment'}
            </button>

            </div>

            <p
              style={{
                fontSize:
                  '0.85rem',
                marginTop:
                  '10px',
                opacity: 0.7,
              }}
            >
              Personalised products may not qualify for
              change-of-mind cancellation. Your legal rights
              for faulty or misdescribed goods still apply.
            </p>

            <p className="smCheckoutPolicyLinks">
              Please review our{' '}
              <Link href="/terms">terms</Link>,{' '}
              <Link href="/returns">returns and cancellations</Link>,{' '}
              <Link href="/delivery">delivery information</Link>, and{' '}
              <Link href="/privacy">privacy notice</Link> before payment.
            </p>

            <Link
              href="/cart"
              className="checkoutBackLink"
            >
              Back to basket
            </Link>

            <div className="checkoutTrust">
              <strong>
                Smart Memories
              </strong>

              <p>
                Your photo, voice
                message and
                personalisation
                remain linked to
                your order through
                the Smart Memories
                system.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
