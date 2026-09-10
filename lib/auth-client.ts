"use client";

import {
  GoogleAuthProvider,
  browserLocalPersistence,
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
  return signInWithPopup(firebaseAuth, provider);
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
  if (code.includes("operation-not-allowed")) return "This sign-in method is not enabled yet in Firebase Authentication.";
  if (code.includes("account-exists-with-different-credential")) return "An account already exists with this email using a different sign-in method.";
  if (code.includes("email-already-in-use")) return "An account with this email already exists. Sign in instead.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  if (code.includes("weak-password")) return "Choose a stronger password.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "Incorrect email or password.";
  if (code.includes("too-many-requests")) return "Too many attempts. Wait a moment and try again.";
  if (code.includes("network-request-failed")) return "Network error. Check your connection and try again.";
  return fallback;
}
