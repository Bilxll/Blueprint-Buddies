import { adminAuth } from "./firebase-admin";
import type { DecodedIdToken } from "firebase-admin/auth";

export async function requireUser(request: Request): Promise<DecodedIdToken> {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new Error("UNAUTHENTICATED");
  try { return await adminAuth().verifyIdToken(token, true); }
  catch { throw new Error("UNAUTHENTICATED"); }
}

export function adminEmails() {
  return (process.env.ADMIN_EMAILS || "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
}

export async function requireAdmin(request: Request) {
  const user = await requireUser(request);
  const admins = adminEmails();
  if (!user.email || user.email_verified !== true || !admins.includes(user.email.toLowerCase())) throw new Error("FORBIDDEN");
  return user;
}
