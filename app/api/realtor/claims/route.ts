import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { appendSheetRow } from "@/lib/google";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    if (user.email_verified !== true) return NextResponse.json({ ok: false, error: "Verify your email before claiming leads." }, { status: 403 });
    const { leadId } = await request.json();
    if (!leadId) return NextResponse.json({ ok: false, error: "Lead ID required." }, { status: 400 });
    const db = adminDb();
    const realtorSnap = await db.collection("realtors").where("uid", "==", user.uid).limit(1).get();
    if (realtorSnap.empty) return NextResponse.json({ ok: false, error: "Realtor profile missing." }, { status: 404 });
    const realtor = realtorSnap.docs[0].data();
    if (realtor.verificationStatus !== "verified") return NextResponse.json({ ok: false, error: "Realtor verification is required." }, { status: 403 });
    const claimId = `CLM_${leadId}_${user.uid}`;
    const claimRef = db.collection("leadClaims").doc(claimId);
    const leadRef = db.collection("leads").doc(leadId);
    let claim: Record<string, unknown> = {};
    await db.runTransaction(async tx => {
      const leadSnap = await tx.get(leadRef);
      if (!leadSnap.exists) throw new Error("LEAD_NOT_FOUND");
      const lead = leadSnap.data()!;
      if (lead.city !== realtor.city || !realtor.areas?.includes(lead.area)) throw new Error("OUTSIDE_TERRITORY");
      const existingClaim = await tx.get(claimRef);
      if (existingClaim.exists) throw new Error("ALREADY_CLAIMED");
      if ((lead.claimCount || 0) >= (lead.maxClaims || 3)) throw new Error("CLAIM_LIMIT");
      const now = new Date().toISOString();
      claim = { id: claimId, leadId, realtorId: realtor.id, realtorUid: user.uid, status: "new", notes: "", claimedAt: now, updatedAt: now };
      tx.set(claimRef, claim);
      tx.update(leadRef, { claimCount: (lead.claimCount || 0) + 1, updatedAt: now });
    });
    appendSheetRow("LeadClaims", claim).catch(console.error);
    return NextResponse.json({ ok: true, claimId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const map: Record<string,string> = { LEAD_NOT_FOUND: "Lead no longer exists.", OUTSIDE_TERRITORY: "This lead is outside your territory.", ALREADY_CLAIMED: "You already claimed this lead.", CLAIM_LIMIT: "This lead has reached its claim limit." };
    return NextResponse.json({ ok: false, error: map[message] || "Could not claim this lead." }, { status: message === "UNAUTHENTICATED" ? 401 : 400 });
  }
}
