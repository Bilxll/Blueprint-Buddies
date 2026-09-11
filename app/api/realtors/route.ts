import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { realtorSchema } from "@/lib/validation";
import { appendSheetRow } from "@/lib/google";
import { appConfig } from "@/lib/config";
import { normalizePakistanPhone } from "@/lib/security";
import { randomUUID } from "node:crypto";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = realtorSchema.parse(await request.json());
    const db = adminDb();
    const existing = await db.collection("realtors").where("uid", "==", user.uid).limit(1).get();
    if (!existing.empty) return NextResponse.json({ ok: true, existing: true, realtor: existing.docs[0].data() });
    const now = new Date().toISOString();
    const authProvider = user.firebase?.sign_in_provider === "google.com" ? "google" : "email";
    const realtor = {
      id: `RTL_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
      uid: user.uid,
      email: user.email?.toLowerCase() || "",
      ...body,
      phone: normalizePakistanPhone(body.phone),
      whatsapp: normalizePakistanPhone(body.whatsapp),
      authProvider,
      termsAcceptedAt: now,
      logoDriveFileId: body.logoDriveFileId || "",
      verificationStatus: "pending",
      status: "active",
      planId: "beta",
      subscriptionStatus: "pending_verification",
      creditsBalance: 0,
      billingMode: appConfig.billingMode,
      createdAt: now,
      updatedAt: now,
    };
    await db.collection("realtors").doc(realtor.id).set(realtor);
    appendSheetRow("Realtors", realtor).catch(error => console.error("sheet-realtor", error));
    return NextResponse.json({ ok: true, realtor });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    console.error("realtor-create", error);
    return NextResponse.json({ ok: false, error: code === "UNAUTHENTICATED" ? "Please sign in first." : "Could not create realtor profile." }, { status: code === "UNAUTHENTICATED" ? 401 : 400 });
  }
}
