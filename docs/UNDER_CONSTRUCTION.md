# Temporary under-construction screen and owner-only preview

Smart Memories is hidden behind a branded **Website under construction / under development** page until it is ready to launch.

## What visitors see
- Browsing the root, /shop, /m/<memory-code>, or any other page returns the construction message, with HTTP 503 and noindex/no-store headers.
- Non-owner API and POST requests return HTTP 503.
- The existing signed Stripe webhook POST endpoint remains functional for already-created test/live orders; its handler still verifies Stripe's signature.
- JavaScript/CSS build assets and the favicon are excluded from the proxy so the login form works. This app-level privacy gate is **not** a substitute for protecting static assets and external Supabase public storage.

## Owner access
1. Open https://smartmemories.co.uk/admin/login (or click **Owner access** in the public construction screen).
2. Sign in with an existing Supabase admin account listed in the server-only **ADMIN_EMAILS** setting.
3. Once signed in, access the full site (including /shop and /create) and the admin dashboard normally.
4. /admin/forgot-password, /admin/auth/callback, and /admin/update-password stay available for owner password recovery.
5. To permit **only one specific owner** when ADMIN_EMAILS has several admins, set **SITE_PREVIEW_OWNER_EMAIL** to that owner's existing admin email in Vercel's Environment Variables for Production. This is a server-only variable, never NEXT_PUBLIC_. Unset or empty means all accounts in ADMIN_EMAILS can preview.

## Enable or disable
The page is **on by default**, including if SITE_MAINTENANCE_MODE is unset. For a normal public launch, set **SITE_MAINTENANCE_MODE=false** in Vercel Environment Variables and redeploy. Set it to true (or remove it) and redeploy to close the public site again.

## Deployment and validation checklist
1. Confirm the correct admin account exists in ADMIN_EMAILS and can log in. Optionally configure SITE_PREVIEW_OWNER_EMAIL to the single desired account.
2. Run npm ci, npm test, npx tsc --noEmit and npm run build.
3. Deploy and open a private/incognito window. Check /, /shop, /m/sample and /api/memories show the construction page or 503. Check POST requests are blocked (do not make actual Stripe charges).
4. Sign in at /admin/login and verify /, /shop, /create, /admin and an authorised test memory are accessible.
5. Sign out and confirm those pages are hidden again. Verify mobile presentation and the password-reset flow.
6. Review any separately public Supabase Storage buckets or shared file URLs: the proxy cannot revoke access to them.

If *complete* privacy of the entire Vercel deployment is essential, enable **Vercel Authentication → All Deployments** under Vercel Security → Deployment Protection (available on every plan as of September 2026). That stronger protection shows Vercel's own sign-in challenge **instead of** the public construction page. A separate public landing project/domain would be needed to combine full deployment authentication with an anonymous public announcement page.
