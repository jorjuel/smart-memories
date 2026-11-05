'use client';

import Link from 'next/link';

import {
  useEffect,
  useState,
} from 'react';

import {
  usePathname,
} from 'next/navigation';

const shopGroups = [
  {
    title: 'Love & Couples',
    items: [
      {
        label: 'Anniversary',
        href: '/shop?occasion=Anniversary',
      },
      {
        label: 'Wedding',
        href: '/shop?occasion=Wedding',
      },
      {
        label: 'Our Story',
        href: '/shop?occasion=Anniversary',
      },
    ],
  },

  {
    title: 'Family',
    items: [
      {
        label: 'Mum',
        href: '/shop?occasion=Family%20Memory',
      },
      {
        label: 'Dad',
        href: '/shop?occasion=Family%20Memory',
      },
      {
        label: 'Grandparents',
        href: '/shop?occasion=Family%20Memory',
      },
      {
        label: 'Family Memories',
        href: '/shop?occasion=Family%20Memory',
      },
    ],
  },

  {
    title: 'Baby Memories',
    items: [
      {
        label: 'New Baby',
        href: '/shop?occasion=New%20Baby',
      },
      {
        label: 'First Birthday',
        href: '/shop?occasion=Birthday',
      },
      {
        label: 'Baby Keepsakes',
        href: '/shop?occasion=New%20Baby',
      },
    ],
  },

  {
    title: 'Pet Memories',
    items: [
      {
        label: 'Pet Keepsakes',
        href: '/shop?occasion=Pet%20Memory',
      },
      {
        label: 'Pet Memorials',
        href: '/shop?occasion=Pet%20Memory',
      },
    ],
  },

  {
    title: 'Remembrance',
    items: [
      {
        label: 'Forever Voice',
        href: '/shop?occasion=Remembrance',
      },
      {
        label: 'Memorial Gifts',
        href: '/shop?occasion=Remembrance',
      },
    ],
  },

  {
    title: 'Birthdays & Celebrations',
    items: [
      {
        label: 'Birthdays',
        href: '/shop?occasion=Birthday',
      },
      {
        label: 'Graduation',
        href: '/shop?occasion=Graduation',
      },
      {
        label: 'Special Milestones',
        href: '/shop?occasion=Birthday',
      },
    ],
  },
];

export default function SiteHeader() {
  const pathname =
    usePathname();

const hideForRecipientMemory =
  pathname === '/m' ||
  pathname.startsWith(
    '/m/'
  );

  const [
    shopOpen,
    setShopOpen,
  ] = useState(false);

  useEffect(() => {
    setShopOpen(false);
  }, [pathname]);

if (
  hideForRecipientMemory
) {
  return null;
}

  function closeMenus() {
    setShopOpen(false);
  }

  return (
    <header className="smSiteHeader">
      <div className="smHeaderInner">
        <Link
          href="/"
          className="smHeaderBrand"
          onClick={closeMenus}
        >
          SMART MEMORIES
          <span>♥</span>
        </Link>

        <nav
          className="smDesktopNav"
          aria-label="Main navigation"
        >
       <div
          className="smShopMenu"
          onMouseLeave={() =>
            setShopOpen(false)
          }
        >
           <button
              type="button"
              className={
                shopOpen ||
                pathname.startsWith('/shop') ||
                pathname.startsWith('/cards') ||
                pathname.startsWith('/occasions') ||
                pathname.startsWith('/bundles')
                  ? 'smNavButton smNavActive'
                  : 'smNavButton'
              }
              aria-expanded={
                shopOpen
              }
              onClick={() =>
                setShopOpen(
                  (current) =>
                    !current
                )
              }
            >
              Shop
              <span
                className="smMenuChevron"
                aria-hidden="true"
              >
                ▾
              </span>
            </button>

            {shopOpen && (
              <div className="smShopDropdown">
                <div className="smShopDropdownIntro">
                  <span>
                    SHOP BY MEMORY
                  </span>

                  <strong>
                    Start with who
                    or what you want
                    to remember.
                  </strong>
                </div>

                <div className="smShopDropdownGrid">
                  {shopGroups.map(
                    (
                      group
                    ) => (
                      <div
                        key={
                          group.title
                        }
                        className="smShopGroup"
                      >
                        <strong>
                          {
                            group.title
                          }
                        </strong>

                        {group.items.map(
                          (
                            item
                          ) => (
                            <Link
                              key={
                                item.label
                              }
                              href={
                                item.href
                              }
                              onClick={
                                closeMenus
                              }
                            >
                              {
                                item.label
                              }
                            </Link>
                          )
                        )}
                      </div>
                    )
                  )}

                  <div className="smShopGroup smShopSpecialGroup">
                    <strong>
                      More ways to
                      remember
                    </strong>

                    <Link
                      href="/cards"
                      onClick={
                        closeMenus
                      }
                    >
                      Smart Cards
                    </Link>

                    <Link
                      href="/occasions"
                      onClick={
                        closeMenus
                      }
                    >
                      All Occasions
                    </Link>

                    <Link
                      href="/shop"
                      onClick={
                        closeMenus
                      }
                    >
                      All Gifts
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/create"
            className={
              pathname === '/create'
                ? 'smCreateNavCta smNavActive'
                : undefined
            }
          >
            Create a Memory
          </Link>

          <Link
            href="/how-it-works"
            className={
              pathname === '/how-it-works'
                ? 'smNavActive'
                : undefined
            }
          >
            How It Works
          </Link>

          <a href="/memories"
            className={
              pathname.startsWith('/memories')
                ? 'smNavActive'
                : undefined
            }
          >
            My Memories
          </a>

          <a href="/account/orders"
            className={
              pathname.startsWith('/account/orders')
                ? 'smNavActive'
                : undefined
            }
          >
            My Orders
          </a>
        </nav>

        <div className="smHeaderUtilities">
          <a href="/account"
            className="smUtilityLink"
          >
            Account
          </a>

          <Link
            href="/cart"
            className="smCartLink"
          >
            Basket
          </Link>

          <Link href="/shop" className="smMobileQuickShop" onClick={closeMenus}>
            Shop
          </Link>
          <Link href="/menu" className="smMobileToggle" onClick={closeMenus}>
            Menu
          </Link>
        </div>
      </div>

    </header>
  );
}