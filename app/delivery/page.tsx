import Link from 'next/link';
import { UK_SHIPPING_PENCE, ROYAL_MAIL_LARGE_LETTER_100G_PENCE } from '@/lib/shippingPricing';

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
        <h3>Single Smart Memory gift tag with bow — UK postage</h3>
        <p>Royal Mail 2nd Class Large Letter: <strong>{gbp(ROYAL_MAIL_LARGE_LETTER_100G_PENCE.standard)}</strong>.</p>
        <p>Royal Mail 1st Class Large Letter (online postage): <strong>{gbp(ROYAL_MAIL_LARGE_LETTER_100G_PENCE.express)}</strong>.</p>
        <p>These envelope prices apply to one gift tag only, provided the final packaged item weighs no more than 100g and measures no more than 35.3cm × 25cm × 2.5cm. If its packaging is thicker, heavier or larger, a higher postage category is required. A flat standard Letter costs less but must be 5mm thick or less, so a decorative bow may not fit.</p>
        <h3>Other UK gifts and combined orders</h3>
        <p>Standard UK delivery: <strong>{gbp(UK_SHIPPING_PENCE.standard)}</strong>.</p>
        <p>Express UK delivery: <strong>{gbp(UK_SHIPPING_PENCE.express)}</strong>. Express shipping starts after production.</p>
        <p>Other gift delivery charges are flat checkout rates, not a carrier quote. We are reviewing the final packaging weight, dimensions and service coverage for larger gifts, combined orders and bundles before switching on live payments. The applicable delivery charge is shown in your checkout total before payment.</p>
        <h2>Production and delivery times</h2>
        <p>Every gift is made to order. Production time depends on its design and printing requirements. Standard and express options apply after production; neither is a guaranteed arrival date. Verified dispatch and delivery estimates will be published before live payments are enabled.</p>
        <h2>Order tracking</h2>
        <p>Customers with an account can view their order status under My Orders. When a tracked parcel is actually dispatched, the dispatch email can include its carrier and tracking reference.</p>
        <h2>Problems with a delivery</h2>
        <p>If you have a question about delivery or a missing parcel, contact Smart Memories with your order number. Your statutory rights are not affected.</p>
      </div>
      <div className="actions"><Link href="/account/orders" className="btn">My Orders</Link><Link href="/contact" className="btn secondary">Contact</Link></div>
    </section>
  );
}
