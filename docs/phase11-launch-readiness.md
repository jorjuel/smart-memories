# Smart Memories — Phase 11 commercial launch gate

Status: **NOT READY FOR LIVE PAYMENTS** (audit started 4 November 2026).

This list is an operational launch gate, not a legal opinion. Do not switch to Stripe live keys until all blockers below have been resolved and verified.

## Confirmed through sandbox customer/owner tests
- [x] Create and retrieve a personalised gift memory
- [x] Signed-in saved drafts and restoration
- [x] Stripe sandbox order/payment visible as paid in customer account and admin
- [x] Order confirmation email received
- [x] NFC sticker and QR code open correct recipient memory
- [x] Physical test gift quality checks reported complete
- [x] Owner production status editing and order details tested

## Must complete before accepting real orders
- [ ] Sole-trader setup confirmed by owner on 4 November 2026. Publish the sole trader's verified legal name, the Smart Memories trading name, genuine geographical business/contact address and direct support email (VAT details only if applicable). Business address is still to be arranged. Do not invent or expose a private residential address.
- [ ] When trader details are ready, configure SMART_MEMORIES_TRADER_LEGAL_NAME, SMART_MEMORIES_TRADER_ADDRESS and SMART_MEMORIES_TRADER_EMAIL in deployment environment; review the displayed terms, policies, contact and order paperwork. Keep SMART_MEMORIES_LIVE_PAYMENTS_ENABLED unset/false until all launch checks pass.
- [ ] Finalise business terms. Specify contract formation, prices/taxes, customisation approval, delivery estimates, responsibility for submitted media, digital-memory access, and duration/availability. Obtain legal review.
- [ ] Finalise UK GDPR privacy notice based on the *actual* Supabase, Vercel, Stripe, email, logs and storage configuration: controller, contact, legal bases, processors/recipients, international transfers, retention periods, access controls, rights and complaints routes. Verify deletion/export workflows.
- [ ] Review returns and cancellation copy against UK consumer rules, including custom-made goods exceptions and fault remedies; provide postal return arrangements. Check applicability for any non-personalised item.
- [ ] Test consent/cookie behavior and prepare required cookies information if analytics/non-essential cookies are in use.
- [ ] Verify each gift's packed weight and dimensions, packaging cost, tracking level, compensation and provider coverage; replace flat shipping pricing if large/bundle products need higher rates.
- [ ] Set evidence-based production and delivery targets and explain express service accurately.
- [ ] Decide geographical delivery scope; implement postcode/country/address checks consistent with offered shipping service, not just a free-form postcode.
- [ ] Verify sample confirmation email includes legally required contract information or links to durable terms as appropriate.
- [ ] Test dispatch notification without falsely asserting shipment; sandbox order must not generate a live shipment claim unless explicitly testing with a controlled inbox and labelled sandbox email.
- [ ] Define and test tracking updates, damaged/missing parcels, refunds and cancellation support.
- [ ] Check accessibility, mobile checkout, long names/address, unsupported payment conditions and error handling.
- [ ] Verify live Stripe account identity, live webhook endpoint/signing secret, currency, taxes, receipts and refunds **in a controlled release** after everything above. The Stripe helper now rejects an sk_live_ key unless SMART_MEMORIES_LIVE_PAYMENTS_ENABLED=true and the three verified trader identity variables are set.
- [ ] Separate live and test orders and prevent test orders from being counted as revenue, inventory fulfilment or dispatch.
- [ ] Verify uploaded content permissions, recipient link sharing/privacy protections, and deletion policy before promising long-term hosting.
- [ ] Test a production deployment with current Next.js and dependency audit, security review, monitoring and backups.

## Project source observations (4 November 2026)
- Checkout has been using Stripe sandbox successfully, but historical UI still claimed it was unconnected. Changed on this branch.
- `/terms` and `/privacy` explicitly say they need final legal/commercial review.
- `/returns` explains personalised-goods exception but indicates missing trader details and returns address.
- `/delivery` offers provisional £3.95 standard and £6.95 express, pending item-specific packaging and time verification.
- Existing admin dispatch action marks an order dispatched then sends an email declaring real dispatch; do not use this solely to simulate shipment.

## Official references for final review
- UK online selling: https://www.gov.uk/online-and-distance-selling-for-businesses/online-selling
- UK distance selling: https://www.gov.uk/online-and-distance-selling-for-businesses
- ICO privacy information: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/

## Sole trader documentation actions (owner to complete)
- Confirm whether HMRC Self Assessment registration is required based on trading income and tax circumstances; check the official HMRC guidance.
- Choose a legitimate geographical business contact address at which the trader can receive correspondence and legal documents (and a returns arrangement). A virtual mailbox is not automatically sufficient for all legal requirements: verify suitability before use.
- Confirm a reliable business email address and configure `CONTACT_EMAIL_TO`, `CONTACT_EMAIL_FROM` or `DISPATCH_EMAIL_FROM` and `RESEND_API_KEY` for support messages.
- Check whether ICO data protection fee registration is required; use the ICO checker.
- Complete the legal/privacy/returns content and contact disclosures before live checkout.

Official references: https://www.gov.uk/become-sole-trader/choose-your-business-name ; https://www.gov.uk/online-and-distance-selling-for-businesses/online-selling ; https://ico.org.uk/for-organisations/advice-for-small-organisations/getting-started-with-gdpr/assessment-for-small-business-owners-and-sole-traders/
