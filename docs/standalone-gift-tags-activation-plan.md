# Standalone Smart Memory Gift Tags — delivery and activation plan

**Status:** concept storefront built; no purchase, activation, tag issuance or memory claim is live yet.

## The customer promise

- A customer buys a standalone physical tag for a gift obtained elsewhere.
- The tag is preprogrammed with a unique Smart Memories URL.
- The purchaser can attach it to their gift and activate the accompanying memory later.
- Recipients tap with NFC or scan QR to open the same personal memory page.
- Proposed formats: Everyday tag (£8.95), Keepsake tag (£11.95), 3-pack (price TBD). Prices are provisional, NOT approved product prices.

## Security boundary — mandatory before checkout is exposed

A publicly scannable NFC/QR code must **never** be the sole credential that lets a stranger claim or overwrite an unclaimed memory. Possession of the printed public URL is not proof of purchase. Use separate credentials:

1. `public_code`: random, non-sequential public URL identifier used by NFC and QR to open a public recipient view. This is **not** a secret.
2. `claim_secret`: a separate high-entropy, single-use token supplied privately to the buyer after paid checkout (or on a concealed scratch panel). Store only its cryptographic hash; never show it on the public tag.
3. `owner_user_id`: authenticated Supabase user who claims the tag. Email verification required.
4. `paid_order_item_id`: valid paid order line that authorises issuance. Provision tags only after verified Stripe payment, not simply a success-page redirect.
5. `status`: created → paid → claimable → claimed → active (plus revoked). No public API may advance these statuses.
6. Rate-limit claim attempts, limit tag creation to authorised owner/admin actions, and audit activation + revocation. A tag must not be claimable twice.
7. Never allow the tag public URL to expose the claim secret or account ownership details. Unactivated tags show a neutral message, never an editing form.
8. Once claimed, the purchaser edits their memory through authenticated account access. Recipient view remains read-only.
9. Store and display a documented hosting term, deletion policy and lost-tag recovery process before accepting orders.

## Supabase schema proposal (migration for later phase)

Table `gift_tags`:
- `id uuid primary key default gen_random_uuid()`
- `public_code text not null unique`
- `claim_secret_hash text not null unique` (hash token using a server-only pepper or HMAC; do not persist the raw secret)
- `paid_order_item_id uuid not null` (foreign key to paid order item)
- `owner_user_id uuid null`
- `memory_code text null unique` (link to existing memories model)
- `status text not null` with check constraint
- `claimed_at timestamptz null`, `created_at timestamptz not null`, `updated_at timestamptz not null`

Use RLS for customers (owner can read only their own tags) and service role for provisioning/claims. Never return a `claim_secret_hash` to browsers. Confirm existing orders and memory table constraints before shipping migration.

## Implementation gates

1. Finalise physical tag dimensions, chosen materials, NFC chip model, print/packaging and pricing margins.
2. Build schema, server-only creation from verified paid order items and authenticated claim endpoint.
3. Build claim page, activation tests (unpaid claim, duplicate claim, brute-force attempts, unowned access, stolen public QR), and edit-in-account flow.
4. Test actual NFC tags on iPhone and Android and QR fallback, including revoked/unclaimed states.
5. Verify shipping price and material cost, legal copy, data retention and customer support procedure.
6. Only then enable checkout for gift tags. Stripe remains **test mode** for the overall site until explicit approval.

## Web changes in this draft

- `/gift-tags`: responsive, dedicated product concept page with three planned variants and four-step explanation.
- `/shop`: dedicated standalone gift-tag accordion, linked to the page.
- Uses on-brand CSS illustrations. These do not represent photographed, validated physical samples.
- No SKU inserted into live `lib/products.ts`, because that would route customers to the existing unsuitable generic product checkout/personaliser.
