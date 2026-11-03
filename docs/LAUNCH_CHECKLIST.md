# Smart Memories — prelaunch release checklist

This is an operational checklist, not a statement of legal compliance.

## Verified technical functionality
- [x] Stripe sandbox checkout and signed webhook update Supabase paid orders.
- [x] Resend sandbox order-confirmation email delivered to test inbox.
- [x] Verified-email customer account can query guest orders in code (requires manual browser test).
- [x] Sandbox/test payments labelled in the owner dashboard.

## Customer journey — still requires manual browser tests
- [ ] Create a new customer account; confirm email; sign in; sign out.
- [ ] Close browser/reopen; confirm session persistence.
- [ ] Request password recovery; follow email; update password; sign in.
- [ ] Check guest checkout order with confirmed matching email in My Orders.
- [ ] Confirm unrelated orders cannot be accessed by other customers.
- [ ] Check mobile checkout, shipping total, receipt, failed payment and cancelled payment.
- [ ] Test customer support / corporate enquiry transmission and spam protection.
- [ ] Check image, audio, memory page privacy and NFC/QR access controls.

## Before enabling real Stripe keys
- [ ] Publish trading legal name, contact email, geographical business address, and (if applicable) registration and VAT details.
- [ ] Review and publish final Privacy Policy with data controller details, lawful bases, recipients, retention periods, third-party storage/hosting, international transfers, user rights and contact method.
- [ ] Review and publish full Terms, including how orders are accepted, pricing, amendments, refunds, cancellation, digital memory availability and consumer rights.
- [ ] Confirm realistic production time, delivery geography, dispatch carriers, shipping timeframes and supported delivery options.
- [ ] Publish the applicable returns procedure and an address for returns.
- [ ] Verify no false success messages from contact forms.
- [ ] Verify accessibility, error states, and fulfilment / order reconciliation.
- [ ] Configure Stripe live account, separate sk_live and whsec live destination; verify domain, prices and webhook events.
- [ ] Perform one authorised, small-value real payment end-to-end and refund it through Stripe after verifying the order lifecycle.
- [ ] Confirm cookie/analytics consent requirements based on actual scripts used.

## References
- UK Government online selling guidance: https://www.gov.uk/online-and-distance-selling-for-businesses/online-selling
- UK Government returns/refunds guidance: https://www.gov.uk/accepting-returns-and-giving-refunds
- ICO privacy notice guidance: https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/how-to-write-a-privacy-notice-and-what-goes-in-it/

**Never enable real-money checkout based solely on a passing build.**
