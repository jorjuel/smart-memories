import Link from 'next/link';

const links = [
  { href: '/create', label: 'Create a Memory & Add a Gift', description: 'Start with your message, then choose digital, gift tag or a keepsake' },
  { href: '/cards', label: 'Handcrafted cards', description: 'Traditional and Smart Memory cards' },
  { href: '/occasions', label: 'Browse by occasion', description: 'Choose an occasion for your memory and optional gift' },
  { href: '/bundles', label: 'Gift bundles', description: 'Collections and thoughtful combinations' },
  { href: '/how-it-works', label: 'How it works', description: 'See how tapping a gift opens a memory' },
  { href: '/memories', label: 'My Memories', description: 'Find your saved memories' },
  { href: '/account/orders', label: 'My Orders', description: 'Track your gift orders' },
  { href: '/account', label: 'My Account', description: 'Sign in or manage your account' },
  { href: '/cart', label: 'Basket', description: 'Review your selected gifts' },
];

export default function MenuPage() {
  return (
    <section className="smStandaloneMenu">
      <span className="eyebrow">SMART MEMORIES</span>
      <h1>Explore Smart Memories</h1>
      <p>Start by creating a personal memory, then choose how to share it.</p>
      <div className="smStandaloneMenuLinks">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="smStandaloneMenuLink">
            <span><strong>{link.label}</strong><small>{link.description}</small></span>
            <span aria-hidden="true">›</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
