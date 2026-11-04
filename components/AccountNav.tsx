'use client';

import Link from 'next/link';

import {
  usePathname,
} from 'next/navigation';

export default function AccountNav() {
  const pathname =
    usePathname();

  function active(
    href: string
  ) {
    if (
      href ===
      '/account'
    ) {
      return (
        pathname ===
        '/account'
      );
    }

    return pathname.startsWith(
      href
    );
  }

  return (
    <nav
      className="smAccountNav"
      aria-label="Customer account"
    >
      <a href="/memories"
        className={
          active(
            '/memories'
          )
            ? 'active'
            : ''
        }
      >
        Memories
      </a>

      <a href="/account/drafts" className={active('/account/drafts') ? 'active' : ''}>
        Drafts
      </a>

      <a href="/account/orders"
        className={
          active(
            '/account/orders'
          )
            ? 'active'
            : ''
        }
      >
        Orders
      </a>

      <a href="/account"
        className={
          active(
            '/account'
          )
            ? 'active'
            : ''
        }
      >
        Account
      </a>

      <Link
        href="/create"
        className="smAccountCreate"
      >
        Create Memory
      </Link>
    </nav>
  );
}