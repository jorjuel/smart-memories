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
      <Link
        prefetch={false}
        href="/memories"
        className={
          active(
            '/memories'
          )
            ? 'active'
            : ''
        }
      >
        Memories
      </Link>

      <Link
        prefetch={false}
        href="/account/orders"
        className={
          active(
            '/account/orders'
          )
            ? 'active'
            : ''
        }
      >
        Orders
      </Link>

      <Link
        prefetch={false}
        href="/account"
        className={
          active(
            '/account'
          )
            ? 'active'
            : ''
        }
      >
        Account
      </Link>

      <Link
        href="/create"
        className="smAccountCreate"
      >
        Create Memory
      </Link>
    </nav>
  );
}