import './globals.css';

import Link from 'next/link';

import SiteHeader from '../components/SiteHeader';

export const metadata = {
  title:
    'Smart Memories | Tap. Remember. Relive.',
  description:
    'Create a personalised Smart Memory with photographs, words, voice and meaningful moments — connected to a gift they can tap and relive.',
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />

        <main>
          {children}
        </main>

        <footer className="siteFooter">
          <div className="footerBrand">
            <Link
              href="/"
              className="footerLogo"
            >
              SMART MEMORIES
              <span>♥</span>
            </Link>

            <p>
              Some gifts hold a
              photo.
              <br />
              Smart Memories holds
              the story.
            </p>

            <small className="footerBrandLine">
              Tap. Remember. Relive.
            </small>
          </div>

          <div className="footerLinks">
            <div>
              <strong>
                CREATE
              </strong>

              <Link href="/create">
                Create a Memory
              </Link>

              <Link href="/shop">
                Smart Gifts
              </Link>

              <Link href="/cards">
                Smart Cards
              </Link>

              <Link href="/occasions">
                Shop by Occasion
              </Link>
            </div>

            <div>
              <strong>
                YOUR MEMORIES
              </strong>

              <Link href="/memories">
                My Memories
              </Link>

              <Link href="/account/orders">
                My Orders
              </Link>

              <Link href="/account">
                Account
              </Link>

              <Link href="/cart">
                Basket
              </Link>
            </div>

            <div>
              <strong>
                DISCOVER
              </strong>

              <Link href="/how-it-works">
                How It Works
              </Link>

              <Link href="/about">
                About Smart Memories
              </Link>

              <Link href="/contact">
                Contact
              </Link>
            </div>

            <div>
              <strong>
                INFORMATION
              </strong>

              <Link href="/privacy">
                Privacy Policy
              </Link>

              <Link href="/terms">
                Terms
              </Link>
            </div>
          </div>

          <div className="footerBottom">
            <span>
              ©{' '}
              {new Date().getFullYear()}{' '}
              Smart Memories
            </span>

            <Link
              href="/admin"
              className="ownerLink"
            >
              Owner
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}