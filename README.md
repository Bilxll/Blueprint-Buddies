# BLUEPRINT BUDDIES — Beta MVP

A Pakistan-first property-demand marketplace connecting structured buyer/seller/investor/renter requirements with verified realtors by city and territory.

## What is implemented
- Raw Form / Brutalist Poster landing experience
- Buy / sell / invest / rent multi-step lead funnel
- Automatic intent scoring (HOT / WARM / FUTURE / NEEDS VERIFICATION)
- Firebase Authentication for realtors
- Realtor application + admin verification
- Territory-filtered lead marketplace
- Atomic Firestore lead claiming with claim limits
- Contact details hidden until successful claim
- Claimed-lead WhatsApp handoff
- Lead feedback endpoint
- Admin lead and realtor review dashboard
- Google Sheets operational mirroring
- Google Drive image upload endpoint
- Source/UTM capture
- Health endpoint
- Pricing disabled for beta; claim architecture ready for packages/credits

## Run locally
1. Copy `.env.example` to `.env.local` and fill credentials.
2. `npm install`
3. `npm run sheets:init`
4. `npm run dev`
5. Open `http://localhost:3000`

## Important
Clash Display and Satoshi are referenced as preferred font families, but font files are not bundled. Add properly licensed webfont files or use your licensed font provider before production. Fallback fonts are already configured.

See `docs/SETUP.md` and `docs/ARCHITECTURE.md`.
