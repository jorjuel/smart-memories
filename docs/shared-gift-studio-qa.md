# Shared Smart Memories gift studio — verification before deployment

The five launch gifts now share one UX: photo and physical-gift wording, optional written message, voice recording or upload and sender on one creation page, then a separate final page showing the physical gift and Smart Memory phone preview. This work builds on draft PR #66 and PR #65.

## Routes to check

- /shop/smart-photo-slate → /slate/review
- /shop/coaster-set → /gift/review/coaster-set
- /shop/photo-mug → /gift/review/photo-mug
- /shop/keyring → /gift/review/keyring
- /shop/mouse-mat → /gift/review/mouse-mat

Legacy /personalise/[slug] links route these five to the same editor. Other legacy products remain unchanged.

## Safe verification

1. Run `npm.cmd test` and `npm.cmd run build` locally after pulling the feature branch.
2. For each product: upload a sample photo, switch Fit whole photo / Fill area, rotate/zoom, edit physical wording and an optional Smart Memory message, and record/playback a 5-second voice clip. Confirm screen two matches the first and has working Edit my gift.
3. Confirm memory NFC recipient preview shows the **original** image, written message and voice recording; check mobile and desktop.
4. Inspect physical artwork downloaded from the order record, **not only the decorative product mockup**. Mug, keyring and mouse-mat renderings are illustrative; ask suppliers for actual print dimensions, printable area, bleed and handles/edges before printing.
5. On coasters, test Single, Set of 2, 4 and 6 and upload different images in the same chooser. The first image repeats to fill unused print slots. Verify each order image and number of physical coasters before fulfilment.
6. Verify cart product slugs, product name, order total, guest checkout, Stripe test mode, media upload and correct basket return.
7. Confirm switching among five product pages never loads another product's draft or voice recording.
8. Check owner permissions, published templates, customer orders, existing memory links and gift-tag flows for regressions.

## Important limits

- This is a **draft feature**, not ready to merge or deploy until local build and browser checks pass.
- Prices use existing `lib/products.ts` values. Coaster set quantities and variable slate sizes have **not been priced per size/quantity**. Finalise and test prices before taking real orders.
- Product shell effects (mug handle, coaster edge, metal keyring and slate stone) are preview decorations only. They are not the printable file.
- The print surface aspect ratios for non-slate products are approximations pending supplier-specific dimensions. Never print fulfilment files without physical sample validation.
- The shared client retains the original photo and optional audio in browser IndexedDB until the customer confirms and adds it to basket. Review retention and privacy before launch.

