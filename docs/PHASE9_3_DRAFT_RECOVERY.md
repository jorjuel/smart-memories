# Phase 9.3 — Private cloud draft recovery

## What the change does
- Personalising a gift while signed in creates a private cloud draft after the first change, then autosaves text, design choices, current step, photo and voice recording.
- My Drafts: `/account/drafts` lists only drafts belonging to the authenticated customer, with a resume link to the correct gift.
- Resume fetches stored form settings and short-lived signed links for photo/audio in the private `draft-media` bucket.
- Once a Smart Memory is successfully created, the draft is marked completed so it disappears from My Drafts.
- Unfinished drafts are not orders. Existing My Orders and paid memory pages are unchanged.

## Important activation requirement — must complete in Supabase
**The feature is OFF by default to protect existing gift creation until database setup is complete.** After applying the migration, set Vercel environment variable `NEXT_PUBLIC_DRAFTS_ENABLED=true` and redeploy for the appropriate environment. Do not enable it before applying the migration. **The GitHub deployment does not migrate Supabase.** In the connected Smart Memories Supabase project, open **SQL Editor** and execute the SQL in `docs/phase9-3-memory-drafts.sql` once.

The migration creates `memory_drafts` with owner-scoped RLS and a **private** `draft-media` storage bucket. Do not change the existing `memory-media` bucket's visibility. Without this SQL, gift creation still works but My Drafts displays an unavailable message and autosave reports a storage error. Do not claim recovery works until the migration and a real browser test pass.

## Security boundaries
- User identity is read from authenticated Supabase cookies via `auth.getUser()`.
- Every draft read and update filters on `user_id`. A draft ID by itself gives no access.
- Media upload tokens are issued only for draft records owned by the authenticated user; file formats and sizes are allowlisted.
- Private media links are signed for a short time. Do not put them in publicly accessible recipient pages.
- Memory save still uses its existing separate final media upload, leaving the gift and checkout workflows intact.
- New private storage uses private bucket and no unauthenticated read policies.

## Limitations and outstanding before real launch
- **Only signed-in customers** get cloud drafts. Guest personalisation is not autosaved; customers must sign in to use drafts.
- Customer editing of a *completed* memory is a separate feature.
- An interruption before the first autosave completes may still lose recent edits; the UI shows saving/saved states.
- Consider scheduled cleanup for completed drafts and superseded private media files, explicit retention limits and upload rate limits.
- Verify that the signed photo/audio downloads can be fetched by each browser used, including mobile.
- Verify behaviour if customer account session expires during editing: autosave should visibly fail and must not expose private files.
- Verify that different user accounts cannot access each other's drafts even with known draft IDs.

## Acceptance checklist (manual browser required)
1. [ ] Apply migration in Supabase SQL Editor.
2. [ ] Sign in, start a new gift, type recipient and message, and wait for “Draft saved securely.”
3. [ ] Upload a photo and recording; wait for the saved indicator before closing the browser.
4. [ ] Reopen `/account/drafts` and click Resume My Gift.
5. [ ] Confirm photo/audio playback, message, product design, and step are restored.
6. [ ] Resume on a different browser signed into the **same** test account.
7. [ ] Sign into a second test account and verify the draft is hidden and its URL is inaccessible.
8. [ ] Complete gift creation and confirm the completed draft is removed from My Drafts.
9. [ ] Complete a Stripe **sandbox** checkout with the saved gift and verify order history.
10. [ ] Test interrupted network, missing media, expired sessions, and mobile screens.

**Business mailing address remains pending and Stripe must remain in sandbox.**
