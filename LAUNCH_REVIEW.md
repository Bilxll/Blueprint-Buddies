# BLUEPRINT BUDDIES — Launch Candidate 0.4.0

This release is designed for a public **free beta**. Real paid checkout remains intentionally disabled until a payment provider, webhook verification, refund rules, pricing, and commercial legal review are complete.

## End-to-end workflows now in code

### Consumer
Guest user → Buy/Sell/Invest/Rent requirement → validation + consent → Firestore lead → private `LEAD_...` reference → `/track` with reference + original phone → admin verification → matching marketplace.

### Operations
Firebase admin login → lead queue → Verify / Flag / Reject / Reopen / Archive → realtor queue → Verify / Reject / Reopen / Suspend / Reactivate → beta credit adjustment → audit log.

### Realtor
Google or email signup → email verification → realtor profile → optional agency-logo upload → admin approval → starter beta credits → discovery by territory/specialty → atomic claim + credit debit → contact unlock → WhatsApp → CRM stage + private notes → lead-quality feedback.

### Data
Firestore is the live application database. Browser Firestore access is denied by rules. Google Sheets mirrors operational records. Google Drive stores authenticated realtor logo uploads under `Realtor Logos`.

## Launch safety

Production defaults use `BILLING_MODE=beta_credits` and `ALLOW_TEST_PURCHASES=false`. Security headers, sitemap, robots, support/FAQ, error states, health probes, tracking rate limits, upload validation/rate limits, lead deduplication, and a production launch checker are included.

## External actions still required

1. Use a newly generated Firebase Admin private key in environment variables. Never reuse the previously exposed key.
2. Enable Email/Password + Google in Firebase Authentication and authorize the production hostname.
3. Share the **Blueprint Buddies Drive folder** with `firebase-adminsdk-fbsvc@blueprint-buddies.iam.gserviceaccount.com` as Editor. The operations spreadsheet is already shared.
4. Enable Google Sheets API + Google Drive API for the service-account project.
5. Set the final HTTPS `NEXT_PUBLIC_APP_URL`, support email, and `ADMIN_EMAILS`.
6. Run `npm run sheets:init`, deploy Firestore rules/indexes, `npm run launch:check:production`, `npm run build`, and then the QA flow in `TEST_FLOW.md`.
