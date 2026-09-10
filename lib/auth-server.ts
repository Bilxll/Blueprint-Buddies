import { adminAuth } from "./firebase-admin";
import type { DecodedIdToken } from "firebase-admin/auth";

export async function requireUser(request: Request): Promise<DecodedIdToken> {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new Error("UNAUTHENTICATED");
  return adminAuth().verifyIdToken(token);
}

export async function requireAdmin(request: Request) {
  const user = await requireUser(request);
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
  if (!user.email || !admins.includes(user.email.toLowerCase())) throw new Error("FORBIDDEN");
  return user;
}
