'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Site navigation intentionally uses regular links rather than dropdowns.
 * All category browsing lives on /shop, avoiding the old overlapping
 * desktop mega-menu and the blank mobile overlay.
 */
export default function SiteHeader() {
  const pathname = usePathname();

  // Recipient memory pages should remain immersive and header-free.
  if (pathname === '/m' || pathname.startsWith('/m/')) {
    return null;
  }

  const shopActive =
    pathname.startsWith('/shop') ||
    pathname.startsWith('/cards') ||
    pathname.startsWith('/occasions') ||
    pathname.startsWith('/bundles');

  return (
    <header className="smSiteHeader">
      <div className="smHeaderInner">
        <Link href="/" className="smHeaderBrand">
          SMART MEMORIES<span>♥</span>
        </Link>

        <nav className="smDesktopNav" aria-label="Main navigation">
          <Link href="/shop" className={shopActive ? 'smNavActive' : undefined}>
            Shop
          </Link>
          <Link
            href="/create"
            className={pathname === '/create' ? 'smCreateNavCta smNavActive' : undefined}
          >
            Create a Memory
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
