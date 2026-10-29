import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Smart Memories | Personalised Gifts You Can Hear',
  description:
    'Personalised photo gifts with a hidden Smart Memory. Add your photograph, words and voice — one tap brings the memory back.',
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="siteHeader">
          <Link href="/" className="brand">
            SMART MEMORIES <span>♥</span>
          </Link>

          <nav className="mainNav">
            <Link href="/shop">Shop</Link>
            <Link href="/cards">Handcrafted Cards</Link>
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/create">Create</Link>
            <Link href="/memories">My Memories</Link>
            <Link href="/cart">Basket 🛍️</Link>
            <Link href="/account">Account</Link>
          </nav>
        </header>

        <main>{children}</main>

        <footer className="siteFooter">
          <div className="footerBrand">
            <Link href="/" className="footerLogo">
              SMART MEMORIES <span>♥</span>
            </Link>

            <p>
              Some moments deserve to be heard
              <br />
              as well as seen.
            </p>
          </div>

          <div className="footerLinks">
            <div>
              <strong>SHOP</strong>
              <Link href="/shop">Smart Gifts</Link>
              <Link href="/cards">Handcrafted Cards</Link>
              <Link href="/create">Create a Memory</Link>
              <Link href="/cart">Basket</Link>
            </div>

            <div>
              <strong>DISCOVER</strong>
              <Link href="/how-it-works">How It Works</Link>
              <Link href="/about">Our Story</Link>
              <Link href="/contact">Contact</Link>
            </div>

            <div>
              <strong>YOUR MEMORIES</strong>
              <Link href="/memories">My Memories</Link>
              <Link href="/account">Account</Link>
            </div>
          </div>

          <div className="footerBottom">
            <span>© {new Date().getFullYear()} Smart Memories</span>

            <Link href="/admin" className="ownerLink">
              Owner
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}