import { redirect } from 'next/navigation';
import { isPromotionPdfOwner } from '@/lib/promotionPdfs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const formatDate = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default async function FairVisitsPage() {
  if (!(await isPromotionPdfOwner())) redirect('/admin/login');

  try {
    const client = supabaseAdmin();
    const sources = [
      { source: 'qr', label: 'Printed QR code' },
      { source: 'tap', label: 'Physical tap tag' },
    ];
    const totals = await Promise.all(sources.map(async ({ source, label }) => {
      const { data, count, error } = await client.from('fair_link_opens')
        .select('opened_at', { count: 'exact' })
        .eq('source', source)
        .order('opened_at', { ascending: false })
        .limit(1);
      if (error || count === null) throw new Error('Fair counts unavailable');
      return { label, count, latest: data[0]?.opened_at };
    }));

    return (
      <section className="wrap">
        <h1>Fair visits</h1>
        <p><strong>{totals.reduce((sum, item) => sum + item.count, 0)}</strong> total link opens</p>
        <p>Repeat opens count separately. Times are shown in UK local time.</p>
        <div className="grid">
          {totals.map(({ label, count, latest }) => (
            <article key={label} className="card">
              <h2>{label}</h2>
              <p><strong>{count}</strong> opens</p>
              <p>{latest ? <>Last opened <time dateTime={latest}>{formatDate.format(new Date(latest))}</time></> : 'No opens recorded yet.'}</p>
            </article>
          ))}
        </div>
      </section>
    );
  } catch {
    return (
      <section className="wrap">
        <h1>Fair visits</h1>
        <p>Visit totals are unavailable. Check that the fair tracking database migration has been applied.</p>
      </section>
    );
  }
}
