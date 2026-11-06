'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Site navigation intentionally uses regular links rather than dropdowns.
 * The primary journey is memory-first at /create. Legacy /shop links
 * lead there too, avoiding competing starting points and mobile menus.
 */
export default function SiteHeader() {
  const pathname = usePathname();

  // Recipient memory pages should remain immersive and header-free.
  if (pathname === '/m' || pathname.startsWith('/m/')) {
    return null;
  }

  const createActive =
    pathname === '/create' ||
    pathname.startsWith('/create/') ||
    pathname === '/shop' ||
    pathname.startsWith('/shop/');

  return (
    <header className="smSiteHeader">
      <div className="smHeaderInner">
        <Link href="/" className="smHeaderBrand">
          SMART MEMORIES<span>♥</span>
        </Link>

        <nav className="smDesktopNav" aria-label="Main navigation">
          <Link
            href="/create"
            className={createActive ? 'smCreateNavCta smNavActive' : 'smCreateNavCta'}
          >
            Create a Memory &amp; Gifts
          </Link>
          <Link
            href="/how-it-works"
            className={pathname === '/how-it-works' ? 'smNavActive' : undefined}
          >
            How It Works
          </Link>
          <Link
            href="/memories"
            className={pathname.startsWith('/memories') ? 'smNavActive' : undefined}
          >
            My Memories
          </Link>
          <Link
            href="/account/orders"
            className={pathname.startsWith('/account/orders') ? 'smNavActive' : undefined}
          >
            My Orders
          </Link>
        </nav>

        <div className="smHeaderUtilities">
          <Link href="/account" className="smUtilityLink">
            Account
          </Link>
          <Link href="/cart" className="smCartLink">
            Basket
          </Link>
          <Link href="/menu" className="smMobileToggle" aria-label="View menu">
            Menu
          </Link>
        </div>
      </div>
    </header>
  );
}
