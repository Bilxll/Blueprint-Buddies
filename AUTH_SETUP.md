# BLUEPRINT BUDDIES authentication setup

The code supports:

- Realtor sign-up with email + password
- Realtor sign-up with Google
- Sign-in with email + password
- Sign-in with Google
- Password reset emails
- Email verification for email/password accounts
- Persistent Firebase sessions
- Automatic routing for admins, existing realtors, and new realtor accounts
- Realtor-profile verification before marketplace access

## Firebase Console switches required

Code alone cannot enable Firebase identity providers. In Firebase Console for the `blueprint-buddies` project:

1. Open **Authentication** → **Sign-in method**.
2. Enable **Email/Password**.
3. Enable **Google**, select a project support email, and save.
4. In Authentication settings, check **Authorized domains**. Add the exact domains used to run the app when needed, including the production Vercel/custom domain and the exact GitHub Codespaces preview host if Firebase reports `auth/unauthorized-domain` during preview testing.

No new environment variables are required beyond the existing `NEXT_PUBLIC_FIREBASE_*` client configuration and Firebase Admin server variables.

## Security flow

Consumers still do not create accounts. Authentication is for realtors/admins only.

Email/password realtor accounts receive an email-verification link. Marketplace leads remain locked until the Firebase email is verified and the realtor profile has been approved by an admin. Google accounts normally arrive with a verified Google email, but still require realtor-profile approval.
