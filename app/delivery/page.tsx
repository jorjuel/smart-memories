import Link from 'next/link';
import { SHIPPING_PRICES_PENCE } from '@/lib/pricing';

export const metadata = {
  title: 'Delivery Information | Smart Memories',
};

function gbp(pence: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100);
}

export default function DeliveryPage() {
  return (
    <section className="narrow infoPage">
      <span className="v14Eyebrow">HELP & INFORMATION</span>
      <h1>Delivery information</h1>
      <p className="lead">Personalised gifts are prepared to order. Delivery charges are shown before you pay.</p>
      <div className="card">
        <h2>Delivery charges</h2>
        <p>Standard delivery: <strong>{gbp(SHIPPING_PRICES_PENCE.standard)}</strong>.</p>
        <p>Express delivery: <strong>{gbp(SHIPPING_PRICES_PENCE.express)}</strong>.</p>
        <p>The checkout calculates the delivery price for your selected option and includes it in your final order total.</p>
        <h2>Production and delivery times</h2>
        <p>Production time depends on the product and its personalisation. We have not yet published a verified production and transit-time promise. Estimated delivery dates must be confirmed before real-money checkout is enabled.</p>
        <h2>Order tracking</h2>
        <p>Customers with an account can view their order status under My Orders. Where available, dispatch information is provided when the order is shipped.</p>
        <h2>Problems with a delivery</h2>
        <p>If you have a question about delivery or a missing parcel, contact Smart Memories with your order number. Your statutory rights are not affected.</p>
      </div>
      <div className="actions"><Link href="/account/orders" className="btn">My Orders</Link><Link href="/contact" className="btn secondary">Contact</Link></div>
    </section>
  );
}
