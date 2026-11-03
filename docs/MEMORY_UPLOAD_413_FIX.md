# Memory media upload fix — 2026-11-03

## Symptom
When creating a Smart Gift, the save button could show `Unexpected token 'R', "Request En"... is not valid JSON`.

## Root cause
The previous product personaliser posted the photo (up to 10 MB) and voice message (up to 25 MB) as a single multipart request to `/api/memories`. Vercel Functions reject requests over 4.5 MB with a 413 non-JSON response. The client then called `response.json()` unconditionally.

## Change
- Upload photo and audio separately from the browser to Supabase using short-lived, path-scoped signed upload tokens.
- The server signs only supported image/audio file types with size declarations, using random paths in the existing `memory-media` bucket.
- The memory save request now sends small `photoPath`/`audioPath` references instead of the file bodies.
- The save endpoint validates the path, checks that the storage objects exist, and checks their size/type before linking them to the new memory record.
- Unreadable/non-JSON server responses now show useful error messages instead of a JSON parsing exception.
- Legacy multipart handling remains for older callers; this change updates both current `/personalise/[slug]` and direct `/create?direct=1` flows.

## Verification required
- [ ] Create a Smart Gift using a 5–8 MB photo; save should succeed.
- [ ] Add a short recording and confirm photo/audio links open on the generated memory page.
- [ ] Repeat for guest and signed-in customer.
- [ ] Ensure the new media objects are visible in Supabase Storage / memory-media.
- [ ] Check /admin order personalisation and Stripe sandbox checkout.
- [ ] Examine Supabase Storage upload restrictions (maximum file size and allowed MIME types) if uploads are rejected.

## Security and operational follow-up
The upload signing endpoint permits guest uploads because guest personalisation is part of the existing product. Add server-side rate limiting, cleanup of abandoned unsigned-to-order media and appropriate abuse controls before real sales. Signed upload paths are random and tokens are scoped to one path; do not expose the Supabase admin secret to the client.

Stripe remains in sandbox; business mailing address remains pending.
