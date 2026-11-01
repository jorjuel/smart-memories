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

  const [
    shopOpen,
    setShopOpen,
  ] = useState(false);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const [
    mobileShopOpen,
    setMobileShopOpen,
  ] = useState(false);

  useEffect(() => {
    setShopOpen(false);
    setMobileOpen(false);
    setMobileShopOpen(false);
  }, [pathname]);

  function closeMenus() {
    setShopOpen(false);
    setMobileOpen(false);
    setMobileShopOpen(false);
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
       <div className="smShopMenu">
           <button
              type="button"
              className="smNavButton"
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
            className="smCreateNavCta"
          >
            Create a Memory
          </Link>

          <Link href="/how-it-works">
            How It Works
          </Link>

          <Link href="/memories">
            My Memories
          </Link>

          <Link href="/account/orders">
            My Orders
          </Link>
        </nav>

        <div className="smHeaderUtilities">
          <Link
            href="/account"
            className="smUtilityLink"
          >
            Account
          </Link>

          <Link
            href="/cart"
            className="smCartLink"
          >
            Basket
          </Link>

          <button
            type="button"
            className="smMobileToggle"
            aria-expanded={
              mobileOpen
            }
            aria-label={
              mobileOpen
                ? 'Close menu'
                : 'Open menu'
            }
            onClick={() =>
              setMobileOpen(
                (current) =>
                  !current
              )
            }
          >
            {mobileOpen
              ? 'Close'
              : 'Menu'}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="smMobileMenu"
          aria-label="Mobile navigation"
        >
          <Link
            href="/create"
            className="smMobileCreate"
            onClick={
              closeMenus
            }
          >
            Create a Memory
          </Link>

          <button
            type="button"
            className="smMobileShopToggle"
            aria-expanded={
              mobileShopOpen
            }
            onClick={() =>
              setMobileShopOpen(
                (current) =>
                  !current
              )
            }
          >
            <span>
              Shop
            </span>

            <span>
              {mobileShopOpen
                ? '−'
                : '+'}
            </span>
          </button>

          {mobileShopOpen && (
            <div className="smMobileShop">
              {shopGroups.map(
                (
                  group
                ) => (
                  <div
                    key={
                      group.title
                    }
                    className="smMobileShopGroup"
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

              <div className="smMobileShopGroup">
                <strong>
                  Explore
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
                  href="/shop"
                  onClick={
                    closeMenus
                  }
                >
                  All Gifts
                </Link>
              </div>
            </div>
          )}

          <Link
            href="/how-it-works"
            onClick={
              closeMenus
            }
          >
            How It Works
          </Link>

          <Link
            href="/memories"
            onClick={
              closeMenus
            }
          >
            My Memories
          </Link>

          <Link
            href="/account/orders"
            onClick={
              closeMenus
            }
          >
            My Orders
          </Link>

          <Link
            href="/account"
            onClick={
              closeMenus
            }
          >
            Account
          </Link>

          <Link
            href="/cart"
            onClick={
              closeMenus
            }
          >
            Basket
          </Link>
        </nav>
      )}
    </header>
  );
}