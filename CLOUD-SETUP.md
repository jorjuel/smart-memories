# Smart Memories cloud setup

1. Use a separate Supabase project and Stripe test keys for staging. Keep `SMART_MEMORIES_LIVE_PAYMENTS_ENABLED=false`.
2. Provision the current database schema before applying the checked-in migrations. `supabase-setup.sql` bootstraps only the memory table and bucket. A new project still needs the order, card personalisation, and other commerce tables from the existing schema.
3. Apply the memory schema and video limit migration after the memory table exists. Apply the card artwork, product catalogue, frame template, and draft SQL for the features enabled in staging. Check the bucket's actual playback access and 30 MB video limit. The migration preserves existing access settings and legacy media paths.
4. Copy `.env.example` to `.env.local` and fill in the settings for the features in use. Set `NEXT_PUBLIC_SITE_URL` to the HTTPS staging or production address for that environment. Configure matching Supabase authentication redirect URLs and keep server keys out of public variables.
5. Run `npm.cmd ci`, `npm.cmd test`, and `npm.cmd run build` from a clean checkout. Run `npm.cmd run dev` for local testing.
6. Configure shared rate limits for the public media upload and save endpoints at the deployment edge. Verify the recipient link and the media access and retention policies before publishing.
7. In staging, test the signed Stripe webhook, email delivery, admin order details, and NFC and QR playback with a second phone. Follow [the launch checklist](docs/LAUNCH_CHECKLIST.md) before accepting live orders.
