import Link from 'next/link';

const links = [
  { href: '/shop#gifts', label: 'Personalised Gifts', description: 'Mugs, slates, coasters and more' },
  { href: '/cards', label: 'Handmade Cards', description: 'Traditional and Smart Memory cards' },
  { href: '/bundles', label: 'Gift Bundles', description: 'Collections and thoughtful combinations' },
  { href: '/occasions', label: 'Shop by occasion', description: 'Birthday, wedding, remembrance and celebrations' },
  { href: '/how-it-works', label: 'How it works', description: 'See how tapping a gift opens a memory' },
  { href: '/m/sample', label: 'Try a sample memory', description: 'See what a recipient can open' },
  { href: '/cart', label: 'Basket', description: 'Review your selected gifts' },
  { href: '/account', label: 'My Account', description: 'Sign in or manage your account' },
  { href: '/account/orders', label: 'My Orders', description: 'Track your gift orders' },
  { href: '/memories', label: 'My Memories', description: 'Find your saved memories' },
];

export default function MenuPage() {
  return (
    <section className="smStandaloneMenu">
      <span className="eyebrow">SMART MEMORIES</span>
      <h1>Explore Smart Memories</h1>
      <p>Choose where you would like to go.</p>
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
