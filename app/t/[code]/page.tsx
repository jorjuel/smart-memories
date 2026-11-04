import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export default async function GiftTagPublicPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = await params;
  const code = rawCode.trim().toUpperCase();

  if (/^[A-Z2-9]{12}$/.test(code)) {
    try {
      const { data, error } = await supabaseAdmin()
        .from('gift_tags')
        .select('status,memory_code')
        .eq('public_code', code)
        .maybeSingle();

      if (!error && data?.status === 'active' &&
          typeof data.memory_code === 'string' &&
          /^[A-Z2-9]{8}$/.test(data.memory_code)) {
        redirect(`/m/${data.memory_code}`);
      }
    } catch (error) {
      // Next.js redirect throws a control-flow exception; rethrow it.
      if (error && typeof error === 'object' && 'digest' in error &&
          String(error.digest).startsWith('NEXT_REDIRECT')) {
        throw error;
      }
    }
  }

  // Never show an activation/ownership form on the publicly scanned tag.
  // Unknown and unclaimed tags share one neutral, non-enumerating page.
  return (
    <main className="wrap" style={{ maxWidth: 720, padding: '90px 24px', textAlign: 'center' }}>
      <span className="eyebrow">SMART MEMORIES</span>
      <h1>There's a memory waiting to be shared.</h1>
      <p className="lead">
        This gift tag doesn't have a published memory available yet.
        Please try again later or ask the person who gave you the gift.
      </p>
      <p>
        Purchased a Gift Tag yourself? Activate it securely from your account
        using the separate activation details provided with your purchase.
      </p>
      <Link className="btn big" href="/gift-tags/activate">Activate a purchased tag</Link>
      <p style={{ marginTop: 30 }}><Link href="/gift-tags">About Smart Memory Gift Tags</Link></p>
    </main>
  );
}
