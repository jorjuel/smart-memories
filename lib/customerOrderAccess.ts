/**
 * Only users who have confirmed their email may see guest orders
 * matched to that email address. Customer-owned orders remain
 * queried separately using the authenticated user ID.
 */
export function verifiedGuestOrderEmail(user: {
  email?: string | null;
  email_confirmed_at?: string | null;
}): string | null {
  if (!user.email_confirmed_at) return null;

  const email = user.email?.trim().toLowerCase();
  return email || null;
}
