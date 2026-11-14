# Partner referrals — implementation status

This branch is a **non-production foundation**, not an activated referral programme.

## Implemented
- RLS-protected partner, physical-tag, visit, attribution, commission and payout tables (migration not applied).
- Public /r/[code] entry route; validates active partner codes and redirects with a URL-scoped ref parameter.
- Owner-only /admin/referrals partner listing.
- Owner-only SVG QR export through /api/admin/referrals/qr/[partnerId].
- QR library was already installed in package.json; no new dependency added.

## Important remaining tasks (must complete before enabling)
1. Review migration against the real orders primary-key type, VAT and postage schema in a disposable Supabase environment.
2. Build owner-only create/edit/pause partner workflows with cryptographically secure random code generation.
3. **Incomplete:** Checkout forwards `?ref=CODE` to the order API, but the homepage-to-shop-to-checkout journey currently loses this parameter. Implement explicit URL propagation or a privacy-reviewed, consent-aware referral persistence design before pilot.
4. **Partially added, disabled by default:** `/api/orders` calls server-only `referral_record_order_attribution` after order items are saved, if `REFERRALS_ENABLED=true`. Review idempotency retry handling and ensure no orphan orders or lost attributions.
5. **Partially added, disabled by default:** existing signed Stripe webhook calls server-only `referral_record_paid_commission` on both new payments and already-paid retries. The SQL commission insert is unique per order; review VAT basis, refunds and accounting before enabling.
6. Implement proportional refund/chargeback adjustments, full payout ledger, approval and audit log.
7. Add NFC inventory assignment workflow and a printable partner card.
8. Add integration tests for all paths, run npm test, npm run build, validate RLS, review UK privacy/cookie and partner disclosure texts.
9. Perform controlled feature-flag deployment after code review and local/preview verification.

## Manual test plan
- Invalid or paused partner codes redirect to the ordinary homepage.
- Valid code redirects to the homepage with ?ref=CODE (only current URL context; not a guaranteed commission).
- Non-owner callers cannot access the admin listing or QR API.
- Owner can export an SVG QR and decode it to the intended HTTPS referral URL.
- Existing checkout is unchanged by this branch.

Do **not** describe a visit or QR scan as an earned commission; Stripe order attribution is not wired yet.
Do not run the migration on production or merge this branch until outstanding tasks are complete.

## Feature flag and rollout safety

`REFERRALS_ENABLED` must remain unset or `false` in all environments until the migration is verified and integration tests pass. The SQL assumes `orders.id` is UUID and uses `orders.subtotal_pence` as eligible revenue without VAT deduction. This needs explicit VAT decision. No migration or build/test suite has been executed through GitHub connector. Do not enable the flag, merge, or deploy this draft PR.
