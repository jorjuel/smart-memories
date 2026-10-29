'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import PersonalisedProductPreview from '../../components/PersonalisedProductPreview';

type BasketItem = {
  id: string;
  personalisationId?: string;
  memoryCode?: string;

  productType: 'smart-card' | 'traditional-card' | 'product';

  productSlug?: string;

  name: string;
  category?: string;

  occasion?: string;
  design?: string;
  recipient?: string;

  imageUrl?: string | null;

  price: number;
  quantity: number;
};

const CART_KEY = 'smart-memories-cart';

export default function CartPage() {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);

      if (!saved) {
        setItems([]);
        setLoaded(true);
        return;
      }

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        const safeItems = parsed.map((item: any) => ({
          id: item.id || crypto.randomUUID(),

          personalisationId: item.personalisationId,
          memoryCode: item.memoryCode,

          productType:
            item.productType === 'smart-card' ||
            item.productType === 'traditional-card'
              ? item.productType
              : 'product',

          productSlug: item.productSlug,

          name: item.name || 'Smart Memories Product',
          category: item.category,

          occasion: item.occasion,
          design: item.design,
          recipient: item.recipient,

          imageUrl:
            typeof item.imageUrl === 'string' && item.imageUrl.length > 0
              ? item.imageUrl
              : null,

          price: Number(item.price) || 0,
          quantity:
            Number(item.quantity) > 0
              ? Number(item.quantity)
              : 1,
        }));

        setItems(safeItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Could not load basket:', error);
      setItems([]);
    }

    setLoaded(true);
  }, []);

  function saveItems(nextItems: BasketItem[]) {
    setItems(nextItems);

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(nextItems)
    );
  }

  function removeItem(id: string) {
    const nextItems = items.filter(
      (item) => item.id !== id
    );

    saveItems(nextItems);
  }

  function increaseQuantity(id: string) {
    const nextItems = items.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );

    saveItems(nextItems);
  }

  function decreaseQuantity(id: string) {
    const nextItems = items.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: Math.max(
              1,
              item.quantity - 1
            ),
          }
        : item
    );

    saveItems(nextItems);
  }

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        item.price * item.quantity,
      0
    );
  }, [items]);

  if (!loaded) {
    return (
      <section className="basketPage">
        <div className="basketHeader">
          <span className="eyebrow">
            YOUR ORDER
          </span>

          <h1>Your basket</h1>

          <p>Loading your personalised gifts...</p>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="basketPage">
        <div className="basketHeader">
          <span className="eyebrow">
            YOUR ORDER
          </span>

          <h1>Your basket</h1>

          <p>
            Your basket is currently empty.
          </p>
        </div>

        <div className="basketSummary">
          <p>
            Start creating something meaningful.
          </p>

          <Link
            href="/shop"
            className="btn big basketCheckoutButton"
          >
            Shop Smart Gifts →
          </Link>

          <Link
            href="/cards"
            className="basketContinue"
          >
            Browse handcrafted cards
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="basketPage">
      <div className="basketHeader">
        <span className="eyebrow">
          YOUR ORDER
        </span>

        <h1>Your basket</h1>

        <p>
          Review your personalised gifts before
          continuing to checkout.
        </p>
      </div>

      <div className="basketLayout">
        <div className="basketItems">
          {items.map((item) => (
            <article
              key={item.id}
              className="basketItem"
            >
              <div className="basketImage">
                <PersonalisedProductPreview
                  productType={item.productType}
                  productSlug={item.productSlug}
                  imageUrl={item.imageUrl}
                  name={item.name}
                  recipient={item.recipient}
                />
              </div>

              <div className="basketItemDetails">
                <span className="basketItemType">
                  {item.productType === 'product'
                    ? item.category ||
                      'SMART GIFT'
                    : item.productType ===
                      'smart-card'
                    ? 'SMART HANDCRAFTED CARD'
                    : 'HANDCRAFTED CARD'}
                </span>

                <h2>{item.name}</h2>

                {item.recipient && (
                  <p>
                    For:{' '}
                    <strong>
                      {item.recipient}
                    </strong>
                  </p>
                )}

                {item.occasion && (
                  <p>
                    Occasion:{' '}
                    <strong>
                      {item.occasion}
                    </strong>
                  </p>
                )}

                {item.design && (
                  <p>
                    Design:{' '}
                    <strong>
                      {item.design}
                    </strong>
                  </p>
                )}

                {item.memoryCode && (
                  <small className="basketReference">
                    Memory reference:{' '}
                    {item.memoryCode}
                  </small>
                )}

                {item.personalisationId && (
                  <small className="basketReference">
                    Personalisation reference:{' '}
                    {item.personalisationId}
                  </small>
                )}

                <div className="basketItemActions">
                  <div className="basketQuantity">
                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(
                          item.id
                        )
                      }
                      aria-label="Reduce quantity"
                    >
                      −
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity(
                          item.id
                        )
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="basketRemove"
                    onClick={() =>
                      removeItem(item.id)
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="basketItemPrice">
                £
                {(
                  item.price *
                  item.quantity
                ).toFixed(2)}
              </div>
            </article>
          ))}
        </div>

        <aside className="basketSummary">
          <span className="eyebrow">
            ORDER SUMMARY
          </span>

          <div className="basketSummaryLine">
            <span>
              {items.reduce(
                (total, item) =>
                  total +
                  item.quantity,
                0
              )}{' '}
              item
              {items.reduce(
                (total, item) =>
                  total +
                  item.quantity,
                0
              ) === 1
                ? ''
                : 's'}
            </span>

            <strong>
              £{subtotal.toFixed(2)}
            </strong>
          </div>

          <div className="basketSummaryLine">
            <span>Delivery</span>
            <span>
              Calculated at checkout
            </span>
          </div>

          <div className="basketSummaryTotal">
            <span>Subtotal</span>

            <strong>
              £{subtotal.toFixed(2)}
            </strong>
          </div>

          <Link
            href="/checkout"
            className="btn big basketCheckoutButton"
          >
            Continue to checkout →
          </Link>

          <Link
            href="/shop"
            className="basketContinue"
          >
            Continue shopping
          </Link>

          <div className="basketSecurity">
            <strong>
              Your Smart Memory
            </strong>

            <p>
              Your personalisation,
              photograph and voice memory stay
              attached to the product as you move
              through checkout.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}