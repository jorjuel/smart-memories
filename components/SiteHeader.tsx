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

  return (
    <header className="smSiteHeader">
      <div className="smHeaderInner">
        <Link href="/" className="smHeaderBrand">
          SMART MEMORIES<span>♥</span>
        </Link>

        <nav className="smDesktopNav" aria-label="Main navigation">
          <Link href="/shop#gifts" className={pathname.startsWith('/shop') ? 'smNavActive' : undefined}>
            Personalised Gifts
          </Link>
          <Link href="/cards" className={pathname.startsWith('/cards') ? 'smNavActive' : undefined}>Handmade Cards</Link>
          <Link href="/bundles" className={pathname.startsWith('/bundles') ? 'smNavActive' : undefined}>Gift Bundles</Link>
          <Link href="/tags" className={pathname.startsWith('/tags') ? 'smNavActive' : undefined}>Gift Tags</Link>
          <Link
            href="/how-it-works"
            className={pathname === '/how-it-works' ? 'smNavActive' : undefined}
          >
            How It Works
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
