import Link from 'next/link';
import RecipientMemoryExperience from '@/components/recipient/RecipientMemoryExperience';

export default function SampleMemoryPage() {
  return <>
    <div className="smSampleNotice">Sample memory · fictional family and synthetic voice <Link href="/tags">Explore Gift Tags</Link></div>
    <RecipientMemoryExperience memory={{
      code: 'sample', recipient: 'Grandma', sender: 'Mia and Leo',
      photoUrl: '/images/sample-memory-family.webp',
      audioUrl: '/images/sample-memory-grandma.wav',
      message: 'Dear Grandma, we miss you. On Sundays we still leave your favourite spot on the sofa free. The house feels a little quieter without your laugh, and we miss the way you hug us before we’ve even got our coats off. Mum took this photo while we were making you a card. We’ve got a surprise for you when you come over on Sunday. Until then, here’s a little bit of home. Love you all the way to the moon and back.',
    }} />
  </>;
}
