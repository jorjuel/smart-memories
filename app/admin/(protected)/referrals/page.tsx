import { redirect } from 'next/navigation';
import { createSupabaseAdminAuthClient } from '@/lib/supabaseAdminAuthServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export default async function ReferralPartnersPage() {
  // This page is also nested under the existing protected admin layout.
  // Re-check permission here because service-role database access bypasses RLS.
  const auth = await createSupabaseAdminAuthClient();
  const { data: { user } } = await auth.auth.getUser();
  const allowed = (process.env.ADMIN_EMAILS || '').split(',')
    .map(x => x.trim().toLowerCase()).filter(Boolean);
  if (!user?.email || !allowed.includes(user.email.toLowerCase())) {
    redirect('/admin/login');
  }

  const { data: partners, error } = await supabaseAdmin()
    .from('referral_partners')
    .select('id,business_name,referral_code,status,commission_bps,created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <main className="wrap">
      <section className="card">
        <span className="eyebrow">SMART MEMORIES · OWNER AREA</span>
        <h1>Referral Partners</h1>
        <p>Partner programme foundation. Commission recording and checkout attribution are not enabled yet.</p>
        {error ? <p role="alert">Referral tables not available. Review and apply the pending migration in a test Supabase project.</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left' }}>
              <thead><tr><th>Business</th><th>Code</th><th>Rate</th><th>Status</th></tr></thead>
              <tbody>{(partners || []).map(p => (
                <tr key={p.id}>
                  <td>{p.business_name}</td>
                  <td><code>{p.referral_code}</code></td>
                  <td>{(p.commission_bps / 100).toFixed(2)}%</td>
                  <td>{p.status}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
