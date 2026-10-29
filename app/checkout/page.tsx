'use client';
import PersonalisedProductPreview from '../../components/PersonalisedProductPreview';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type BasketItem = {
  id: string;
  personalisationId?: string;
  memoryCode?: string;
  productType: 'smart-card' | 'traditional-card' | 'product';
  productSlug?: string;
  name: string;
  occasion?: string;
  design?: string;
  recipient?: string;
  imageUrl?: string | null;
  price: number;
  quantity: number;
};

const CART_KEY = 'smart-memories-cart';

export default function CheckoutPage() {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [town, setTown] = useState('');
  const [county, setCounty] = useState('');
  const [postcode, setPostcode] = useState('');

  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>(
    'standard'
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error('Could not load basket', error);
    } finally {
      setLoaded(true);
    }
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [items]
  );

  const delivery = deliveryMethod === 'express' ? 6.95 : 3.95;

  const total = subtotal + delivery;

  if (!loaded) {
    return (
      <section className="narrow">
        <h1>Checkout</h1>
        <p>Loading your order...</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="narrow">
        <h1>Checkout</h1>

        <div className="card empty">
          <h2>Your basket is empty.</h2>

          <p>
            Add a personalised Smart Memories gift before continuing to
            checkout.
          </p>

          <Link className="btn" href="/shop">
            Browse gifts
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="checkoutPage">
      <div className="checkoutHeader">
        <span className="v14Eyebrow">SECURE CHECKOUT</span>

        <h1>Almost ready to make it special.</h1>

        <p>
          Confirm your details and delivery information before payment.
        </p>
      </div>

      <div className="checkoutLayout">
        <div className="checkoutMain">

          <section className="checkoutCard">
            <div className="checkoutSectionHeading">
              <span>01</span>

              <div>
                <h2>Contact details</h2>
                <p>We’ll use these details for your order confirmation.</p>
              </div>
            </div>

            <div className="checkoutFieldGrid">
              <label>
                <span>Email address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </label>

              <label>
                <span>Phone number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Optional"
                />
              </label>

              <label>
                <span>First name</span>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </label>

              <label>
                <span>Last name</span>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="checkoutCard">
            <div className="checkoutSectionHeading">
              <span>02</span>

              <div>
                <h2>Delivery address</h2>
                <p>Where should we send your personalised gift?</p>
              </div>
            </div>

            <div className="checkoutFieldGrid">
              <label className="checkoutFull">
                <span>Address line 1</span>
                <input
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                />
              </label>

              <label className="checkoutFull">
                <span>Address line 2</span>
                <input
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Optional"
                />
              </label>

              <label>
                <span>Town / City</span>
                <input
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                />
              </label>

              <label>
                <span>County</span>
                <input
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                />
              </label>

              <label>
                <span>Postcode</span>
                <input
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="checkoutCard">
            <div className="checkoutSectionHeading">
              <span>03</span>

              <div>
                <h2>Delivery method</h2>
                <p>Choose how quickly you’d like your order delivered.</p>
              </div>
            </div>

            <div className="deliveryChoices">
              <button
                type="button"
                className={deliveryMethod === 'standard' ? 'active' : ''}
                onClick={() => setDeliveryMethod('standard')}
              >
                <div>
                  <strong>Standard delivery</strong>
                  <span>Usually 3–5 working days after production</span>
                </div>

                <b>£3.95</b>
              </button>

              <button
                type="button"
                className={deliveryMethod === 'express' ? 'active' : ''}
                onClick={() => setDeliveryMethod('express')}
              >
                <div>
                  <strong>Express delivery</strong>
                  <span>Priority dispatch after production</span>
                </div>

                <b>£6.95</b>
              </button>
            </div>
          </section>

          <section className="checkoutCard paymentPlaceholder">
            <div className="checkoutSectionHeading">
              <span>04</span>

              <div>
                <h2>Payment</h2>
                <p>Secure payment will be handled by Stripe.</p>
              </div>
            </div>

            <div className="paymentPreview">
              <strong>Stripe connection coming next</strong>

              <p>
                Card details are not collected in this development version.
                The final version will use Stripe Checkout or Stripe Payment
                Elements.
              </p>
            </div>
          </section>
        </div>

        <aside className="checkoutSummary">
          <div className="checkoutSummarySticky">
            <span className="v14Eyebrow">YOUR ORDER</span>

            <h2>Order summary</h2>

            <div className="checkoutProducts">
              {items.map((item) => (
                <div className="checkoutProduct" key={item.id}>
                  <div className="checkoutProductImage">
  <PersonalisedProductPreview
    productType={item.productType}
    productSlug={item.productSlug}
    imageUrl={item.imageUrl}
    name={item.name}
    recipient={item.recipient}
  />
</div>

                  <div>
                    <strong>{item.name}</strong>

                    {item.recipient && (
                      <span>For {item.recipient}</span>
                    )}

                    <small>
                      Qty {item.quantity}
                    </small>
                  </div>

                  <b>
                    £{(item.price * item.quantity).toFixed(2)}
                  </b>
                </div>
              ))}
            </div>

            <div className="checkoutTotals">
              <div>
                <span>Subtotal</span>
                <strong>£{subtotal.toFixed(2)}</strong>
              </div>

              <div>
                <span>Delivery</span>
                <strong>£{delivery.toFixed(2)}</strong>
              </div>

              <div className="checkoutGrandTotal">
                <span>Total</span>
                <strong>£{total.toFixed(2)}</strong>
              </div>
            </div>

            <button
              type="button"
              className="personaliseBasketButton"
              disabled
            >
              Secure payment coming next
            </button>

            <Link href="/cart" className="checkoutBackLink">
              ← Back to basket
            </Link>

            <div className="checkoutTrust">
              <strong>Smart Memories</strong>

              <p>
                Your photo, voice message and personalisation remain linked to
                your order through the Smart Memories system.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}