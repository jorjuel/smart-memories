export function getCanonicalSiteUrl() {
  const siteUrl =
    process.env
      .NEXT_PUBLIC_SITE_URL
      ?.trim();

  if (!siteUrl) {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL is missing'
    );
  }

  return siteUrl.replace(
    /\/+$/,
    ''
  );
}

export function normaliseMemoryCode(
  code: string
) {
  return code
    .trim()
    .toUpperCase();
}

export function getMemoryPublicUrl(
  code: string
) {
  const memoryCode =
    normaliseMemoryCode(
      code
    );

  return (
    `${getCanonicalSiteUrl()}` +
    `/m/${encodeURIComponent(memoryCode)}`
  );
}