import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { appendSheetRow } from "@/lib/google";
import { randomUUID } from "node:crypto";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    if (user.email_verified !== true) return NextResponse.json({ ok: false, error: "Verify your email first." }, { status: 403 });
    const { leadId, valid, reason, comment } = await request.json();
    const db = adminDb();
    const realtorSnap = await db.collection("realtors").where("uid", "==", user.uid).limit(1).get();
    if (realtorSnap.empty) throw new Error("NO_PROFILE");
    const realtor = realtorSnap.docs[0].data();
    const claim = await db.collection("leadClaims").where("leadId", "==", leadId).where("realtorUid", "==", user.uid).limit(1).get();
    if (claim.empty) return NextResponse.json({ ok: false, error: "You can only review leads you claimed." }, { status: 403 });
    const row = { id: `FDB_${randomUUID().replace(/-/g, "").slice(0, 16)}`, leadId, realtorId: realtor.id, valid: Boolean(valid), reason: reason || "", comment: comment || "", createdAt: new Date().toISOString() };
    await db.collection("leadFeedback").doc(row.id).set(row); appendSheetRow("LeadFeedback", row).catch(console.error);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: false, error: "Could not submit feedback." }, { status: 400 }); }
}
