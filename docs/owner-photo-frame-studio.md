# Smart Memories Owner Photo & Frame Studio (draft)

## Before merging
- The live website is unchanged until this pull request is merged and deployed.
- Apply `supabase/migrations/20261106_gift_frame_templates.sql` in the **correct Supabase project** first. Review SQL in your own environment.
- Confirm the existing public Supabase bucket `product-catalog` is present and has working server-side upload permissions.
- Ensure `ADMIN_EMAILS`, Supabase URL, and server-only secret are configured for the deployment. Never add the secret to a `NEXT_PUBLIC_` variable.

## Admin
1. Sign in at `/admin/login` as an email explicitly listed in `ADMIN_EMAILS`.
2. At `/admin/products`, replace the main shop photograph as before, or upload multiple alternative images and select **Make main**.
3. At `/admin/templates`, upload a transparent PNG/WebP with a photo opening. Choose relevant products and orientation.
4. Templates are **drafts by default**. Check the visual design before choosing **Publish**. Unpublish to remove the choice from new customer sessions without deleting orders.
5. Names, product assignments, orientation and display sort order can be edited in the owner studio.

## Verification required before deploying
- Run `npm ci`, `npm run build`, `npm test` in the feature branch.
- Verify anonymous users get 403 on all owner write requests and cannot request `GET /api/admin-frame-templates?all=1`. Public published template listing is intentionally readable.
- Upload 2 product photos, change the main photo, check that the shop image changes on desktop/mobile, and delete an extra photo.
- Upload one transparent portrait frame, one landscape frame, and one square frame. Confirm unpublished frames are NOT offered to customers.
- Publish each, select it in the customer design dropdown, and inspect all preview sizes, including the full-screen phone preview.
- Save a design with 1 photo, 2-6 collage photos and multiple coasters. Verify that production printArtworkUrl/printPhotoUrls actually contain the visible frame, not just the original image; test transparency, cropping and orientation.
- Test memory-page NFC/QR links, customer drafts, basket, checkout and order admin to rule out regressions.
- Do not print a real order until a sample of the export is reviewed at real physical product dimensions.
- Rollback: unpublish frames and revert this PR; do not delete existing product-catalog images or memory-media files.

## Limitations
- Gallery alternatives are owner-managed; only the selected main image is shown on shop cards. No customer-facing gallery carousel has been added.
- Uploaded frames are additional templates, not replacements for the built-in template catalogue.
- Existing built-in designs use the previous preview/print treatment.
- Frame art is fit inside print dimensions without distortion; design authors must use the matching target aspect ratio and provide safe margins for text. This version does not offer interactive frame editing or a visual safe-area editor.
- This feature has not been locally built or browser tested by ChatGPT (the runtime cannot clone the repository); the build and manual checks above must pass before merge.
