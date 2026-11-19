export const storefrontOwnerHeader = 'x-smart-memories-storefront-owner';

export function isGiftTagsOnly() {
  return process.env.SITE_GIFT_TAGS_ONLY === 'true';
}

export function isGiftTagProduct(slug: unknown, type: unknown = 'product') {
  return slug === 'memory-tag' && type === 'product';
}

export function isDeferredStorefrontRoute(pathname: string, searchParams: URLSearchParams) {
  return pathname === '/' ||
    /^\/(shop|cards|bundles|occasions|personalise|gift|slate)(\/|$)/.test(pathname) ||
    (pathname === '/create' &&
      (searchParams.get('mode') !== 'tag' || searchParams.has('product')));
}
