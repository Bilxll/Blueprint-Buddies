# Architecture

- **Next.js / Vercel:** UI and authenticated server routes.
- **Firebase Authentication:** realtor/admin login.
- **Cloud Firestore:** live source of truth for leads, realtor profiles, claims, feedback and audit events.
- **Google Sheets:** human-readable operations/reporting mirror. Never controls concurrency-critical logic such as claiming.
- **Google Drive:** image/document storage through server-side API routes.

## Migration boundary
All concurrency and marketplace state lives in Firestore. Google integrations are isolated in `lib/google.ts`. This means the reporting mirror and file store can be replaced independently. When moving to Postgres, keep API contracts stable and replace Firestore calls with repository adapters rather than changing UI flows.

## Security boundary
Consumer lead contact details never appear in the public/available-leads endpoint. Only authenticated, verified realtors who successfully claim a lead can access full contact details through `/api/realtor/claimed`.
