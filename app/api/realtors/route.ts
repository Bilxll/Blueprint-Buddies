import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { realtorSchema } from "@/lib/validation";
import { appendSheetRow } from "@/lib/google";
import { randomUUID } from "node:crypto";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = realtorSchema.parse(await request.json());
    const existing = await adminDb().collection("realtors").where("uid", "==", user.uid).limit(1).get();
    if (!existing.empty) return NextResponse.json({ ok: false, error: "Realtor profile already exists." }, { status: 409 });
    const now = new Date().toISOString();
    const realtor = { id: `RTL_${randomUUID().replace(/-/g, "").slice(0, 16)}`, uid: user.uid, email: user.email || "", ...body, logoDriveFileId: "", verificationStatus: "pending", status: "active", createdAt: now, updatedAt: now };
    await adminDb().collection("realtors").doc(realtor.id).set(realtor);
    appendSheetRow("Realtors", realtor).catch(console.error);
    return NextResponse.json({ ok: true, realtor });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    return NextResponse.json({ ok: false, error: code === "UNAUTHENTICATED" ? "Please sign in first." : "Could not create realtor profile." }, { status: code === "UNAUTHENTICATED" ? 401 : 400 });
  }
}
