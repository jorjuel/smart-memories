import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import AccountNav from '@/components/AccountNav';

export const dynamic='force-dynamic';
export const metadata={robots:{index:false,follow:false}};

type DraftSummary = {
  id:string;product_slug:string;title:string;step_index:number;
  updated_at:string;photo_path:string|null;audio_path:string|null;
};
export default async function MyDraftsPage() {
  const client=await createSupabaseServerClient();
  const {data:{user}}=await client.auth.getUser();
  if(!user)redirect('/account/login');
  const {data,error}=await supabaseAdmin().from('memory_drafts')
    .select('id,product_slug,title,step_index,updated_at,photo_path,audio_path')
    .eq('user_id',user.id).eq('status','draft')
    .order('updated_at',{ascending:false}).limit(40);
  const drafts=(data||[]) as DraftSummary[];
  return (
    <main className="smAccountPage">
      <AccountNav/>
      <section className="smMemoryLibraryHero">
        <div>
          <span className="v14Eyebrow">YOUR UNFINISHED GIFTS</span>
          <h1>My Drafts</h1>
          <p>Pick up where you left off. Saved drafts are private to your verified account.</p>
        </div>
        <Link href="/shop" className="btn big">Create a New Gift</Link>
      </section>
      {error ? (
        <section className="smMemoryLoadError">
          <h2>Cloud drafts are not available yet.</h2>
          <p>The private drafts database needs to be enabled. Existing gifts and orders are unaffected.</p>
        </section>
      ) : drafts.length === 0 ? (
        <section className="smMemoryEmpty">
          <h2>No unfinished drafts</h2>
          <p>When you start personalising a gift while signed in, your progress will appear here after it has been saved.</p>
          <Link href="/shop" className="btn">Explore Gifts</Link>
        </section>
      ) : (
        <section className="smMemoryLibraryGrid">
          {drafts.map(draft=>(
            <article key={draft.id} className="smMemoryLibraryCard">
              <div className="smMemoryCardBody">
                <span className="eyebrow">UNFINISHED SMART GIFT</span>
                <h2>{draft.title}</h2>
                <p>Last saved {new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short'}).format(new Date(draft.updated_at))}</p>
                <p>Step {Math.min(draft.step_index+1,6)} of approximately 6</p>
                <p>{draft.photo_path?'Photo saved · ':''}{draft.audio_path?'Voice saved':''}</p>
                <a className="btn" href={`/personalise/${encodeURIComponent(draft.product_slug)}?draft=${encodeURIComponent(draft.id)}`}>
                  Resume My Gift
                </a>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
