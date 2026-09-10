# CREAIONX PROPERTY — UI/UX Upgrade

This update keeps the Raw Form / Brutalist Poster direction while improving product usability across the public site, consumer intake, realtor onboarding, realtor portal and admin operations.

## Major upgrades

- Responsive full-screen mobile navigation with active-page states.
- More balanced homepage hero and clearer dual audience hierarchy.
- Direct Buy / Sell / Invest / Rent entry cards.
- Better market/city discovery and area-level deep links.
- Four-step consumer lead wizard with step validation, live brief summary and explicit contact permission.
- Area links prefill both city and area in the requirement wizard.
- Three-stage realtor onboarding: Account → Market → Profile.
- Password visibility controls, phone-to-WhatsApp helper and clearer verification messaging.
- Realtor login with password reset flow.
- Realtor portal dashboard with metrics, search, type/intent filters, claim availability and improved lead cards.
- My Leads CRM with stage updates, private notes, WhatsApp links and lead-quality feedback.
- Pakistan local phone normalization for WhatsApp deep links.
- Admin operations dashboard with tabs, search, metrics and clearer verification states.
- Global focus styles, reduced-motion support, improved mobile layouts and loading/404 states.
- Lead contact-consent value added to the API/database model.
- Sheet schema updated for contact consent and CRM conversion events.

## Apply in Codespaces

Upload the UI/UX patch ZIP to the repository root and run:

```bash
unzip -o creaionx-property-ui-ux-update.zip
rm creaionx-property-ui-ux-update.zip
npm install
npm run build
npm run dev
```

After confirming the site:

```bash
git add .
git commit -m "Upgrade CREAIONX Property UI UX and realtor CRM"
git push origin main
```

`.env.local` remains ignored and must never be committed.

## Google Sheets note

Because the lead model now includes `contactConsent` and the CRM records claim-update events in `Conversions`, run this once after the update if you use the Sheets mirror:

```bash
npm run sheets:init
```

The initializer updates headers without changing Firestore, which remains the live application source of truth.
