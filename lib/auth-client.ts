"use client";

import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  setPersistence,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase-client";

export type SessionDestination = "admin" | "realtor" | "new";

export async function prepareAuthPersistence() {
  await setPersistence(firebaseAuth, browserLocalPersistence);
}

export async function signInWithGoogleAccount() {
  await prepareAuthPersistence();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(firebaseAuth, provider, browserPopupRedirectResolver);
}

export async function getSessionDestination(user: User): Promise<{
  role: SessionDestination;
  emailVerified: boolean;
  realtor?: Record<string, unknown> | null;
}> {
  const token = await user.getIdToken();
  const response = await fetch("/api/auth/session", {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error || "Could not verify your account.");
  return body;
}

export function authErrorMessage(error: unknown, fallback = "Authentication failed. Please try again.") {
  const code = String((error as { code?: string; message?: string })?.code || (error as { message?: string })?.message || "");
  if (code.includes("popup-closed-by-user")) return "Google sign-in was cancelled.";
  if (code.includes("popup-blocked")) return "Your browser blocked the Google sign-in window. Allow pop-ups and try again.";
  if (code.includes("operation-not-allowed")) return "Google sign-in is not enabled in Firebase Authentication yet.";
  if (code.includes("unauthorized-domain")) {
    const host = typeof window !== "undefined" ? window.location.hostname : "this domain";
    return `Google sign-in is blocked for ${host}. Add this exact hostname to Firebase Authentication → Settings → Authorized domains.`;
  }
  if (code.includes("invalid-api-key")) return "The Firebase browser API key is missing or incorrect. Check NEXT_PUBLIC_FIREBASE_API_KEY and restart the app.";
  if (code.includes("auth-domain-config-required") || code.includes("missing-auth-domain")) return "The Firebase auth domain is missing. Check NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN.";
  if (code.includes("web-storage-unsupported")) return "This browser is blocking the storage Firebase needs for sign-in. Allow site storage/cookies and try again.";
  if (code.includes("internal-error")) return "Firebase returned an internal authentication error. Retry once, then check the Firebase Authentication provider configuration.";
  if (code.includes("account-exists-with-different-credential")) return "An account already exists with this email using a different sign-in method.";
  if (code.includes("email-already-in-use")) return "An account with this email already exists. Sign in instead.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  if (code.includes("weak-password")) return "Choose a stronger password.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "Incorrect email or password.";
  if (code.includes("too-many-requests")) return "Too many attempts. Wait a moment and try again.";
  if (code.includes("network-request-failed")) return "Network error. Check your connection and try again.";
  return fallback;
}
