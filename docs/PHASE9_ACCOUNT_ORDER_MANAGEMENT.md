# Smart Memories — Phase 9.1 and 9.2

## Implemented
- Customer account overview and My Orders read the live `production_status` rather than the older legacy status field.
- Customer status is payment-aware: pending/failed/refunded orders never appear to be under production.
- Customer account cards identify confirmed sandbox test orders.
- Owner dashboard counts **only confirmed paid live Stripe sessions** in the real-sales production queue, with separate totals for confirmed test payments and unverified-mode orders. This keeps test orders from becoming reported real-money work.
- Owner All Orders screen can filter by payment status and Stripe test/live/unverified environment. Search and existing production filters remain available.
- No order records, payment flags, fulfilment statuses, webhook logic or Stripe credentials were modified.

## Manual test checklist — must be verified with test accounts
- [ ] Register and verify customer email; sign in, sign out and restore sessions.
- [ ] Create sandbox purchase as guest using verified account email; confirm order appears in My Orders and is tagged test.
- [ ] Confirm pending orders display Awaiting Payment and do not show as in production.
- [ ] Move a sandbox order through production statuses in admin; confirm customer-facing label changes accordingly.
- [ ] Ensure unrelated test customer accounts cannot view this order.
- [ ] On /admin, confirm live paid count is zero if only sandbox purchases exist; sandbox and unverified totals remain visible.
- [ ] On /admin/orders?mode=test, confirm only confirmed sandbox sessions are displayed.
- [ ] Confirm payment=pending/paid filters can be combined with mode and product filters.
- [ ] Test dashboard and account order list on mobile and with many orders.

## Launch constraints
Business mailing address is still pending. Stripe remains in sandbox mode. Customer privacy and legal documents require final review before real sales. Do not count verified sandbox payments as revenue.
