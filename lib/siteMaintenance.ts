/**
 * Temporary site privacy controls.
 *
 * Maintenance is ON by default. Set SITE_MAINTENANCE_MODE=false
 * to restore the public website.
 */
export function isMaintenanceActive(value: string | undefined): boolean {
  return value?.trim().toLowerCase() !== 'false';
}

/**
 * Allow just the existing owner login/recovery flow and verified Stripe
 * webhook entry point to run without a signed-in owner session.
 */
export function isMaintenancePublicRoute(pathname: string, method: string): boolean {
  const path = pathname === '/' ? pathname : pathname.replace(/\/+$/, '');
  if (
    path === '/admin/login' ||
    path === '/admin/forgot-password' ||
    path === '/admin/auth/callback' ||
    path === '/admin/update-password'
  ) {
    return true;
  }
  return path === '/api/stripe/webhook' && method === 'POST';
}

/**
 * The email comes only from Supabase auth.getUser(), not from a request
 * parameter or a user-controlled header.
 */
export function isMaintenanceOwner(
  verifiedUserEmail: string | undefined,
  allowedEmailsValue: string | undefined,
): boolean {
  if (!verifiedUserEmail || !allowedEmailsValue) return false;

  const allowed = allowedEmailsValue
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(verifiedUserEmail.trim().toLowerCase());
}
