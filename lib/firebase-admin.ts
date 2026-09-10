import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function privateKey(value?: string) { return value?.replace(/\\n/g, "\n"); }

export function getAdminApp() {
  if (getApps().length) return getApps()[0]!;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const key = privateKey(process.env.FIREBASE_PRIVATE_KEY);
  if (!projectId || !clientEmail || !key) throw new Error("Firebase Admin environment variables are not configured.");
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey: key }), projectId });
}

export function adminDb() { return getFirestore(getAdminApp()); }
export function adminAuth() { return getAuth(getAdminApp()); }
