# BLUEPRINT BUDDIES — Production Beta Setup

## 1. Environment
Copy `.env.production.example` to `.env.local` for Codespaces testing, then replace placeholders. Use a NEW Firebase Admin private key. Never commit `.env.local`.

For public beta keep:

```env
NEXT_PUBLIC_BETA_MODE=true
BILLING_MODE=beta_credits
ALLOW_TEST_PURCHASES=false
```

Set `NEXT_PUBLIC_APP_URL` to the exact HTTPS Codespaces/Vercel/custom-domain URL currently being tested and add its hostname to Firebase Authentication → Settings → Authorized domains.

## 2. Firebase
Enable Email/Password and Google providers. Deploy server-only Firestore rules and indexes:

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes --project blueprint-buddies
```

## 3. Google Workspace
The operations spreadsheet ID and Drive folder ID are already in `.env.production.example`. Share the Blueprint Buddies root folder with the Firebase service account as Editor, then enable Google Sheets API and Drive API.

Initialize/repair workbook tabs and headers:

```bash
npm run sheets:init
```

## 4. Seed public-beta settings

```bash
npm run seed:beta
```

This does not expose self-service test packages unless `BILLING_MODE=test_credits` and `ALLOW_TEST_PURCHASES=true` are deliberately enabled in a non-production test environment.

## 5. Verify and build

```bash
npm run launch:check:production
npm run build
npm run dev
```

Then check `/api/health`. A launch-ready environment returns `ready: true`.

## 6. Smoke test

```bash
APP_URL=https://YOUR-TEST-URL npm run test:smoke
```

This creates a clearly labelled smoke-test buyer requirement and verifies private tracking.
