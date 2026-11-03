import Link from 'next/link';

export const metadata = {
  title: 'Returns and Cancellations | Smart Memories',
};

export default function ReturnsPage() {
  return (
    <section className="narrow infoPage">
      <span className="v14Eyebrow">HELP & INFORMATION</span>
      <h1>Returns and cancellations</h1>
      <p className="lead">Your statutory consumer rights are important, including when a gift is personalised.</p>
      <div className="card">
        <h2>Personalised and custom-made gifts</h2>
        <p>Where an item has been made to your specifications or is clearly personalised, the usual 14-day change-of-mind cancellation right may not apply. This does not affect your rights if the item is faulty, not as described or otherwise fails to meet your legal rights.</p>
        <h2>Non-personalised items</h2>
        <p>For eligible online purchases, you can normally tell us within 14 days of receiving the goods that you wish to cancel, without giving a reason. You then have another 14 days to return the goods. The usual rules for refunds and standard delivery charges apply.</p>
        <h2>Something wrong with your order?</h2>
        <p>If your gift arrives faulty, damaged or materially different from its description, please contact us with your order number and an explanation of the issue. We will consider an appropriate remedy under UK consumer law, which may include a refund, repair or replacement.</p>
        <h2>Contact and return arrangements</h2>
        <p>Use the contact page to raise a return, cancellation or fault query before sending any goods. Return arrangements and any applicable return postage costs will be explained for your case. Your statutory rights are not restricted by this page.</p>
        <p>We are preparing final launch information. Specific contact details and a physical returns address must be published before real customer orders are accepted.</p>
      </div>
      <div className="actions"><Link href="/contact" className="btn">Contact Smart Memories</Link><Link href="/terms" className="btn secondary">Terms</Link></div>
    </section>
  );
}
