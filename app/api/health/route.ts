import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { appConfig, driveConfigured, firebaseAdminConfigured, publicFirebaseConfigured, sheetsConfigured } from "@/lib/config";
import { probeGoogleDrive, probeGoogleSheets } from "@/lib/google";

export const dynamic = "force-dynamic";
async function probe(name: string, fn: () => Promise<unknown>, configured: boolean) {
  if (!configured) return { configured: false, reachable: false, error: `${name} is not configured` };
  try { const data=await fn(); return { configured: true, reachable: true, data }; }
  catch (error) { const detail = error instanceof Error ? error.message : `${name} unavailable`; return { configured: true, reachable: false, error: process.env.NODE_ENV === "production" ? `${name} unavailable` : detail }; }
}
export async function GET() {
  const firebase = await probe("Firebase Admin", async () => { await adminDb().collection("__health").limit(1).get(); return true; }, firebaseAdminConfigured());
  const sheets = await probe("Google Sheets", probeGoogleSheets, sheetsConfigured());
  const drive = await probe("Google Drive", probeGoogleDrive, driveConfigured());
  const clientAuth = { configured: publicFirebaseConfigured(), reachable: publicFirebaseConfigured() };
  const appUrlSafe=process.env.NODE_ENV!=="production"||appConfig.appUrl.startsWith("https://");
  const supportSafe=Boolean(appConfig.supportEmail&&appConfig.supportEmail.includes("@")&&!appConfig.supportEmail.includes("YOUR-DOMAIN"));
  const billingSafe=!(process.env.NODE_ENV==="production"&&appConfig.allowTestPurchases);
  const launchSafety={appUrlSafe,supportSafe,billingSafe};
  const ready = firebase.reachable && sheets.reachable && drive.reachable && clientAuth.reachable && appUrlSafe && supportSafe && billingSafe;
  return NextResponse.json({status:ready?"ready":"degraded",ready,services:{firebase,firebaseClient:clientAuth,sheets,drive},launchSafety,billing:{mode:appConfig.billingMode,beta:appConfig.betaMode,testPurchases:appConfig.allowTestPurchases},version:"0.4.0",timestamp:new Date().toISOString()},{status:ready?200:503});
}
