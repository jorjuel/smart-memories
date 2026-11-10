import Link from 'next/link';
import { digitalOnlyCart, getCartShippingPricePence, type ShippingCartItem } from '../lib/shippingPricing';

export function deliveryMoney(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

export default function DeliverySummary({ items = [{}] }: { items?: readonly ShippingCartItem[] }) {
  const digital = digitalOnlyCart(items);
  return <details className="smDeliverySummary">
    <summary>{digital ? 'Digital delivery · no postage' : <>
      <strong>UK delivery per order</strong>
      <span>Standard {deliveryMoney(getCartShippingPricePence(items, 'standard'))} · Express {deliveryMoney(getCartShippingPricePence(items, 'express'))}</span>
    </>}</summary>
    {!digital && (
      <p>Made to order. Standard and express shipping start after production. Dispatch and transit estimates are awaiting confirmation.</p>
    )}
    <Link href="/delivery">Delivery information</Link>
  </details>;
}
