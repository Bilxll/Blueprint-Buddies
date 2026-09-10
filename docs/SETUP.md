# Setup

## 1. Firebase
Create a Firebase project, enable **Authentication > Email/Password**, create a Firestore database, and add a Web App. Put the public web config into the `NEXT_PUBLIC_FIREBASE_*` variables.

Create a service account for server-side Firebase Admin access and put its project ID, client email and private key into the server-only Firebase variables. Deploy `firebase.rules`; the MVP intentionally blocks direct client access to Firestore because business data is returned through authenticated Vercel routes.

## 2. Google Sheets + Drive
The platform mirrors operational data to Google Sheets and stores approved image uploads in Google Drive. Enable the Google Sheets API and Google Drive API for your Google Cloud project. Create/share the target spreadsheet and Drive folder with the service-account email used by `GOOGLE_CLIENT_EMAIL`.

Run `npm run sheets:init` after setting the Google environment variables. The script creates any missing tabs and headers without deleting existing rows.

## 3. Admin
Add one or more Firebase account emails to `ADMIN_EMAILS`, comma-separated. Those authenticated accounts can open `/admin`.

## 4. Vercel
Import the repository into Vercel, set every production environment variable from `.env.example`, and deploy. Node 22+ is required because Firebase Admin 14.x dropped Node 20 support.

## 5. Beta rules
Pricing is intentionally disabled. `DEFAULT_MAX_CLAIMS=3` makes each opportunity claimable by up to three verified agents. Change it later when packages are introduced.
