# Phase 9 — customer navigation and pending checkout fixes

## Reported in user acceptance testing
- My Orders, My Memories and Account repeatedly redirected a signed-in customer to login.
- An unfinished checkout appeared in My Orders but had no clear route back to finish.
- A verified guest purchase could appear in My Orders while its owner-only Smart Memory page did not recognise the guest purchase as belonging to that customer.

## Changes
1. Add Next.js 16 `proxy.ts` to verify and refresh Supabase session cookies, preserving refreshed request and response cookies.
2. Disable automatic Next.js prefetching on protected account navigation links to avoid replaying a cached unauthenticated redirect after sign-in.
3. Continue to validate user identity server-side with `getUser()` before showing account, orders and memories.
4. Expand customer memory association to verified guest orders only (customer_id is null AND email equals the user's confirmed email). This matches the existing guest order visibility rules.
5. Pending order cards now explain that they are not paid, direct customers to their basket to continue checkout **if the basket is still available on that device**, and explicitly explain that a newly completed checkout receives a new order number.

## Limits and follow-up
- The existing site does not persist a full editable draft of an unfinished product personalisation. Returning to the basket is not the same as resuming all personaliser form fields; a dedicated draft feature is still needed.
- Account browser tests need real sessions. Do not mark resolved until a signed-in customer opens Account, My Orders, and My Memories without repeated login, including after a page refresh.
- Customer editing of a saved memory is not yet implemented. Avoid claiming an edit link is available.
- No order payment status, Stripe keys, old orders, or business address records changed. Stripe stays in sandbox mode.

## Browser checks
- [ ] Sign in; navigate repeatedly between Account → My Orders → My Memories, refresh each and confirm session persists.
- [ ] Open an owner-only memory linked to a completed guest purchase using the same verified email.
- [ ] Use a second account with a different verified email and confirm the first account's orders/memories are not visible.
- [ ] Inspect an unpaid order for the return-to-basket link. If the basket has been cleared, do not assume the old checkout is resumable.
- [ ] After sandbox checkout, check paid status is correctly set.
