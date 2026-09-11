# BLUEPRINT BUDDIES — Acceptance Test

Pass criteria for the production beta:

- [ ] `/api/health` says `ready`.
- [ ] Guest can submit Buy, Sell, Invest and Rent requirements without login.
- [ ] Duplicate same-day property request returns the same lead reference instead of creating another row.
- [ ] Public submission rate limit returns HTTP 429 after the configured threshold.
- [ ] New lead starts unverified and is invisible in realtor marketplace.
- [ ] Admin can verify lead.
- [ ] Realtor can sign up with Google.
- [ ] Realtor can sign up with email/password and receives email verification.
- [ ] Optional realtor logo uploads to Google Drive.
- [ ] Pending realtor cannot access protected leads.
- [ ] Admin verification grants initial beta credits once only.
- [ ] Verified realtor sees only matching city/area/type/property opportunities.
- [ ] Claim deducts the correct credit cost and cannot over-claim a lead.
- [ ] Consumer phone/email are unavailable before claim and available after claim.
- [ ] Suspended/rejected realtor cannot retrieve old protected contacts.
- [ ] CRM status and private notes persist.
- [ ] Lead feedback persists.
- [ ] Test billing package adds credits without charging money.
- [ ] Leads, Realtors, Claims, Feedback, Conversions, CreditLedger and AuditLog mirror to Google Sheets.
- [ ] Firestore browser reads/writes are denied by security rules.
- [ ] `npm run build` passes before deployment.
