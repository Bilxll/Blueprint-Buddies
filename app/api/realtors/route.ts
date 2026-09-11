import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { realtorSchema, realtorUpdateSchema } from "@/lib/validation";
import { appendSheetRow } from "@/lib/google";
import { appConfig } from "@/lib/config";
import { normalizePhone } from "@/lib/security";
import { randomUUID } from "node:crypto";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const snap = await adminDb().collection("realtors").where("uid", "==", user.uid).limit(1).get();
    if (snap.empty) return NextResponse.json({ ok: false, error: "Realtor profile missing." }, { status: 404 });
    return NextResponse.json({ ok: true, realtor: snap.docs[0].data() });
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
}

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
      phone: normalizePhone(body.phone, body.country),
      whatsapp: normalizePhone(body.whatsapp, body.country),
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

export async function PATCH(request: Request) {
  try {
    const user = await requireUser(request);
    const body = realtorUpdateSchema.parse(await request.json());
    const db = adminDb();
    const snap = await db.collection("realtors").where("uid", "==", user.uid).limit(1).get();
    if (snap.empty) return NextResponse.json({ ok: false, error: "Realtor profile missing." }, { status: 404 });
    const ref = snap.docs[0].ref;
    const current = snap.docs[0].data();
    if (current.status === "suspended") return NextResponse.json({ ok: false, error: "This realtor account is suspended." }, { status: 403 });
    const patch = {
      ...body,
      phone: normalizePhone(body.phone, body.country),
      whatsapp: normalizePhone(body.whatsapp, body.country),
      updatedAt: new Date().toISOString(),
    };
    await ref.update(patch);
    const updated = { ...current, ...patch };
    appendSheetRow("Realtors", updated).catch(error => console.error("sheet-realtor-update", error));
    return NextResponse.json({ ok: true, realtor: updated });
  } catch (error) {
    console.error("realtor-update", error);
    return NextResponse.json({ ok: false, error: "Could not update realtor profile." }, { status: 400 });
  }
}
