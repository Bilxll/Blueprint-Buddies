import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { appConfig, driveConfigured, firebaseAdminConfigured, publicFirebaseConfigured, sheetsConfigured } from "@/lib/config";
import { probeGoogleDrive, probeGoogleSheets } from "@/lib/google";

export const dynamic = "force-dynamic";

async function probe(name: string, fn: () => Promise<unknown>, configured: boolean) {
  if (!configured) return { configured: false, reachable: false, error: `${name} is not configured` };
  try { await fn(); return { configured: true, reachable: true }; }
  catch (error) { const detail = error instanceof Error ? error.message : `${name} unavailable`; return { configured: true, reachable: false, error: process.env.NODE_ENV === "production" ? `${name} unavailable` : detail }; }
}

export async function GET() {
  const firebase = await probe("Firebase Admin", async () => { await adminDb().collection("__health").limit(1).get(); }, firebaseAdminConfigured());
  const sheets = await probe("Google Sheets", probeGoogleSheets, sheetsConfigured());
  const drive = await probe("Google Drive", probeGoogleDrive, driveConfigured());
  const clientAuth = { configured: publicFirebaseConfigured(), reachable: publicFirebaseConfigured() };
  const ready = firebase.reachable && sheets.reachable && drive.reachable && clientAuth.reachable;
  return NextResponse.json({
    status: ready ? "ready" : "degraded",
    ready,
    services: { firebase, firebaseClient: clientAuth, sheets, drive },
    billing: { mode: appConfig.billingMode, beta: appConfig.betaMode, testPurchases: appConfig.allowTestPurchases },
    version: "0.2.0",
    timestamp: new Date().toISOString(),
  }, { status: ready ? 200 : 503 });
}
