import Link from 'next/link';
import RecipientMemoryExperience from '@/components/recipient/RecipientMemoryExperience';

export default function SampleMemoryPage() {
  return <>
    <div className="smSampleNotice">Sample memory · fictional message <Link href="/shop#gifts">Explore gifts</Link></div>
    <RecipientMemoryExperience memory={{
      code: 'sample', recipient: 'Sam', sender: 'Jamie',
      message: 'Remember our Sunday walks and the hot chocolate afterwards? Here’s to more slow mornings and little adventures together.',
    }} />
  </>;
}
