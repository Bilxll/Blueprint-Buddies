export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "BLUEPRINT BUDDIES",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  betaMode: String(process.env.NEXT_PUBLIC_BETA_MODE ?? "true").toLowerCase() === "true",
  billingMode: process.env.BILLING_MODE || "test_credits",
  allowTestPurchases: String(process.env.ALLOW_TEST_PURCHASES ?? "true").toLowerCase() === "true",
  defaultMaxClaims: Math.max(1, Number(process.env.DEFAULT_MAX_CLAIMS || 3)),
  defaultBetaCredits: Math.max(0, Number(process.env.DEFAULT_BETA_CREDITS || 20)),
  defaultLeadCreditCost: Math.max(1, Number(process.env.DEFAULT_LEAD_CREDIT_COST || 1)),
  leadRateLimitCount: Math.max(1, Number(process.env.LEAD_RATE_LIMIT_COUNT || 5)),
  leadRateLimitWindowMs: Math.max(60_000, Number(process.env.LEAD_RATE_LIMIT_WINDOW_MS || 600_000)),
};

export function publicFirebaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}

export function firebaseAdminConfigured() {
  return Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}

export function googleCredentialsConfigured() {
  const email = process.env.GOOGLE_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;
  return Boolean(email && key);
}

export function sheetsConfigured() { return googleCredentialsConfigured() && Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID); }
export function driveConfigured() { return googleCredentialsConfigured() && Boolean(process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID); }
export function googleConfigured() { return sheetsConfigured() && driveConfigured(); }
