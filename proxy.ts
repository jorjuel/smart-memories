import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { maintenancePageHtml } from './lib/maintenancePage';
import {
  isMaintenanceActive,
  isMaintenanceOwner,
  isMaintenancePublicRoute,
} from './lib/siteMaintenance';

/**
 * Return a standalone under-construction page rather than rendering the
 * unpublished app shell. Block API and mutation requests as well.
 */
function maintenanceResponse(request: NextRequest): NextResponse {
  const headers = {
    'Cache-Control': 'private, no-store, max-age=0',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
  };

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Smart Memories is under construction.' },
      { status: 503, headers },
    );
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return NextResponse.json(
      { error: 'Smart Memories is under construction.' },
      { status: 503, headers },
    );
  }

  return new NextResponse(maintenancePageHtml, {
    status: 503,
    headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' },
  });
}

/**
 * Check the existing Supabase ADMIN session, using its separate cookie name.
 * This is a verified server-side user lookup, not a cookie/header bypass.
 * No verified owner => visitors always get the construction page.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const adminCookieWrites: Array<(response: NextResponse) => void> = [];
  const adminAuthHeaders = new Headers();

  if (isMaintenanceActive(process.env.SITE_MAINTENANCE_MODE)) {
    const pathname = request.nextUrl.pathname;

    // Password recovery must stay possible. The Stripe webhook validates
    // Stripe's signature in its own handler; no other API is public.
    if (isMaintenancePublicRoute(pathname, request.method)) {
      return NextResponse.next({ request });
    }

    let allowedOwner = false;

    if (url && key) {
      try {
        const admin = createServerClient(url, key, {
          cookieOptions: { name: 'smart-memories-admin-auth' },
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet, headers) {
              cookiesToSet.forEach(({ name, value, options }) => {
                request.cookies.set(name, value);
                adminCookieWrites.push((response) => {
                  response.cookies.set(name, value, options);
                });
              });
              if (headers) {
                Object.entries(headers).forEach(([name, value]) => {
                  adminAuthHeaders.set(name, value);
                });
              }
            },
          },
        });

        const { data, error } = await admin.auth.getUser();
        const ownerEmails =
          process.env.SITE_PREVIEW_OWNER_EMAIL ||
          process.env.ADMIN_EMAILS;

        allowedOwner =
          !error && isMaintenanceOwner(data.user?.email, ownerEmails);
      } catch {
        // Fail closed if Supabase cannot validate the owner session.
        allowedOwner = false;
      }
    }

    if (!allowedOwner) return maintenanceResponse(request);
  }

  /**
   * Preserve the existing customer-session refresh when maintenance is
   * switched off, and for an authorised owner previewing the site.
   */
  let response = NextResponse.next({ request });

  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          if (headers) {
            Object.entries(headers).forEach(([name, value]) =>
              response.headers.set(name, value)
            );
          }
        },
      },
    });

    // Existing customer session refresh; page-level checks remain authoritative.
    await supabase.auth.getClaims();
  }

  // A customer-cookie refresh creates a new response, so apply admin-cookie
  // refreshes last to preserve the owner's login across requests.
  adminCookieWrites.forEach((write) => write(response));
  adminAuthHeaders.forEach((value, name) => response.headers.set(name, value));

  return response;
}

export const config = {
  matcher: [
    // JavaScript and CSS files remain loadable for the owner's login form.
    // All pages, API routes, image optimisation and public media paths go
    // through the gate (including direct /m/<code> links).
    '/((?!_next/static|favicon.ico).*)',
  ],
};
