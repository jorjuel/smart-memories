import Link from 'next/link';
import { includedPromotionPdfs } from '@/lib/promotionPdfs';

const website = 'https://smartmemories.co.uk';

export default function FairSetupPage() {
  return (
    <section className="wrap">
      <span className="eyebrow">SMART MEMORIES</span>
      <h1>Christmas Fair Setup</h1>
      <p>Print your display, prepare your tap tag and check your visit totals from the owner dashboard.</p>
      <div className="grid">
        <article className="card">
          <h2>Print the stall materials</h2>
          <ul>
            {includedPromotionPdfs.map(({ name, file }) => (
              <li key={file}>
                <a href={`/api/admin/promotion-pdfs?file=${encodeURIComponent(file)}`}>
                  {name} · Download PDF
                </a>
              </li>
            ))}
          </ul>
          <p>Print the sign in A3 portrait and the contact slips in A4 portrait. Cut the slips along the dotted line. Put them beside the sign with a pen and a closed collection box.</p>
          <Link href="/admin/promotion-pdfs">Open Promotion PDFs</Link>
        </article>

        <article className="card">
          <h2>Set up the tap tag and QR code</h2>
          <dl>
            <dt><strong>Physical NFC tag</strong></dt>
            <dd><code>{website}/fair/tap</code></dd>
            <dt><strong>QR code printed on the sign</strong></dt>
            <dd><code>{website}/fair/qr</code></dd>
          </dl>
          <p>Write the NFC address to your tag and attach it in the marked space. Both links open the gift-tag page once the update is published.</p>
          <Link href="/tags">Preview the gift-tag page locally</Link>
        </article>

        <article className="card">
          <h2>Track visits</h2>
          <p>Fair Visits shows total link opens, the QR and NFC totals, and the most recent open for each in UK local time. Repeat opens count separately.</p>
          <Link href="/admin/fair-visits">Open Fair Visits</Link>
        </article>

        <article className="card">
          <h2>Before the fair</h2>
          <ol>
            <li>Check Vercel has enough deployment storage for the website update.</li>
            <li>Set up the fair tracking table and private PDF upload storage in Supabase.</li>
            <li>Publish the website update and make the gift-tag page publicly accessible.</li>
            <li>On a phone, scan the printed QR code and tap the physical tag. Check both opens appear in Fair Visits.</li>
          </ol>
          <p>Visitors can use the paper contact slips even if the website is unavailable.</p>
        </article>
      </div>
    </section>
  );
}
