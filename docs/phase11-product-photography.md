# Smart Memories — Product photography and launch asset direction

## Brand direction
**More than a gift. A memory you can relive.**
Visual tone: warm, premium, authentic, contemporary. Keep photography about the recipient's experience, not NFC technology.

## Product-photo specifications
- Catalogue cover: consistent square crop (1:1), minimum 1400 × 1400 px. Export JPEG for the new cloud uploader; web compression is automatic.
- Source photography: shoot at highest natural quality, keep an editable original before cropping.
- Neutral palette: ivory, cream, warm taupe, dusty rose, soft natural wood; avoid overly saturated graphics.
- Soft window light, even shadows, warm but accurate white balance.
- One hero shot per product and later supporting angles when gallery functionality is added.
- Show the product at true scale and material. Use real manufactured samples or clearly label computer-generated mockups as illustrative.
- Never imply every product includes a hidden NFC chip without verifying the product's actual specification and physical placement.
- Use a smartphone in lifestyle photos to demonstrate recipient access. Public-facing explanation: 'Tap your phone here' and 'Or scan the QR code'; small print may mention compatible NFC phones.
- Avoid placing private or genuine customer/child photos/recordings in public advertising without permission.

## Seven catalogue hero-photo briefs
1. **Personalised Photo Slate**: slate standing on unobtrusive wood display stand, clear printed photo, stone edge visible, premium home interior.
2. **Personalised Aluminium Plaque**: brushed or glossy metal photo plaque, minimal background, readable image and realistic reflective highlights.
3. **Personalised Mug**: white ceramic mug at three-quarter angle with visible handle and true printable area.
4. **Personalised Coasters**: arranged set on natural wood coffee table, print in focus, realistic coaster thickness.
5. **Personalised Keyring**: close-up keyring on neutral fabric, hardware visible, product size believable.
6. **Personalised Mouse Mat**: on clean desk with mouse and keyboard, realistic surface and edge stitching.
7. **Personalised White T-Shirt**: accurately sized shirt print shown flat-lay and on a model only when the real print size has been confirmed.

## Marketing shot types
- **Gift close-up**: product and beautiful print, square web cover.
- **The tap moment**: phone close to the gift's marked tap point; neutral overlay 'Tap your phone here'.
- **Memory reveal**: phone shows an authorised demo Smart Memory with photo, message and voice button.
- **Occasion lifestyle**: birthday, anniversary, wedding, pet and remembrance, without using identifiable real customers without consent.

## Suggested export formats
- Web shop: 1400×1400 JPEG; upload via /admin/products.
- Instagram feed: 1080×1350 (4:5).
- Instagram stories/reels cover: 1080×1920 (9:16).
- Keep all sales prices and return conditions separate from photographs so visual assets are reusable.

## Cloud photo setup
1. Run `docs/phase11-product-catalog-storage.sql` once in Supabase SQL Editor.
2. Open `/admin/products` and upload each approved photo.
3. Open the public `/shop` page in a private/incognito mobile browser and verify all seven photographs appear.
4. Replace stale browser-only photos manually; old IndexedDB photos are *not* auto-migrated.
5. Test replacement and deletion for one image before launch.

## Remaining feature review
- Live multi-image galleries for products are **not** part of this change.
- Phone/tablet QA must still be performed in real browsers, with attention to long product names, basket quantity controls, photo upload, email forms and checkout.
- Launch photography must be accurate to the real product; AI renderings are concepts until matched with a physical sample.
