# BLUEPRINT BUDDIES — Production Beta Setup

This build is wired for a full end-to-end beta: guest property requirements, Firebase realtor/admin authentication, admin verification, verified lead marketplace, credit-based claims, CRM pipeline, Google Sheets operations mirror, Google Drive realtor logo uploads, and a test billing simulator.

## 1. Firebase

Use project `blueprint-buddies`.

1. Firebase Authentication → Sign-in method:
   - Enable Email/Password.
   - Enable Google and select a support email.
2. Authentication → Settings → Authorized domains:
   - Add the active Codespaces preview hostname while testing.
   - Add the Vercel hostname and custom domain before launch.
3. Firestore Database:
   - Create the database if it does not already exist.
   - Deploy `firebase.rules` and `firestore.indexes.json` from this repo.
4. Firebase Admin:
   - Generate a NEW private key for `firebase-adminsdk-fbsvc@blueprint-buddies.iam.gserviceaccount.com`.
   - Do not reuse the service-account key that was previously exposed in chat.
   - Never upload the new JSON to GitHub or ChatGPT.

## 2. Google Sheets + Drive

The operations spreadsheet is already configured by ID and has been shared with the Blueprint Buddies Firebase service account.

- Spreadsheet ID: `1DvajQkY32INMAUvrw4Fd7dEKR_pFeJQXBkEHaG-e3uw`
- Drive root folder ID: `1mYoOco3kFsptGJnZQDQskXgTbt3adVfK`

In Google Cloud for the same project, enable:
- Google Sheets API
- Google Drive API

Then manually share the **Blueprint Buddies Drive folder** with:
`firebase-adminsdk-fbsvc@blueprint-buddies.iam.gserviceaccount.com`
as **Editor**. The available connector can share files but not folders, so this one permission must be set in Drive manually.

The backend can reuse the same Firebase service-account credentials for Sheets/Drive, so `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` may stay empty.

## 3. Environment variables

Copy `.env.production.example` to `.env.local` for Codespaces and replace only the private key + admin email/domain values.

Do not commit `.env.local`.

Important beta values:
- `BILLING_MODE=test_credits`
- `ALLOW_TEST_PURCHASES=true`
- `DEFAULT_BETA_CREDITS=20`
- `DEFAULT_LEAD_CREDIT_COST=1`

This simulates paid lead access without taking money. Before a public launch either connect a real payment gateway or set `ALLOW_TEST_PURCHASES=false`.

## 4. Initialize backend

```bash
npm install
npm run sheets:init
npm run seed:beta
npx firebase-tools deploy --only firestore:rules,firestore:indexes --project blueprint-buddies
rm -rf .next
npm run build
npm run dev
```

Visit `/api/health`. A correctly connected environment returns `status: ready` and all four service probes as reachable.

## 5. Admin account

Set `ADMIN_EMAILS` to the exact email you will use to sign in. The account must have a verified Firebase email. A Google account is easiest because Google-authenticated emails are normally already verified.

Admin route: `/admin`

## 6. End-to-end beta test

1. Submit a guest buyer requirement at `/get-started`.
2. Sign in to `/admin` and verify the lead contact.
3. Create a realtor account at `/join-realtor` with Google or email.
4. For email signup, click the Firebase verification link.
5. In `/admin`, verify the realtor. First verification grants the configured beta credits.
6. Sign in as the realtor and open `/realtor/dashboard`.
7. The verified lead appears only when city, area, lead type, and property type match the realtor profile.
8. Claim the lead. One test credit is deducted atomically and the protected consumer contact is unlocked under My Leads.
9. Update CRM stage, notes and lead-quality feedback.
10. Open `/realtor/billing` and activate a test package to confirm credit top-ups.
11. Confirm rows are arriving in the Google Sheets tabs and that an optional realtor logo appears in the Drive folder.

## 7. Automated smoke test

With the dev server running:

```bash
APP_URL=http://localhost:3000 npm run test:smoke
```

This probes `/api/health` and submits a clearly-labelled test buyer lead. Verify or delete that test lead afterward in admin/Firestore.

## 8. Vercel

Add the same variables from `.env.production.example` in Vercel Project → Settings → Environment Variables. Use the production site URL for `NEXT_PUBLIC_APP_URL`.

Never expose these server variables with a `NEXT_PUBLIC_` prefix:
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_CLIENT_EMAIL`
- `ADMIN_EMAILS`

After deploying, add the Vercel/custom hostname to Firebase Authentication authorized domains, then retest `/api/health`, Google login, email login and the complete claim flow.
