import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { appendSheetRow } from "@/lib/google";
import { subscriptionRemaining } from "@/lib/billing";
import { randomUUID } from "node:crypto";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    if (user.email_verified !== true) return NextResponse.json({ ok: false, error: "Verify your email before claiming leads." }, { status: 403 });
    const { leadId } = await request.json();
    if (!leadId) return NextResponse.json({ ok: false, error: "Lead ID required." }, { status: 400 });
    const db = adminDb();
    const realtorSnap = await db.collection("realtors").where("uid", "==", user.uid).limit(1).get();
    if (realtorSnap.empty) return NextResponse.json({ ok: false, error: "Realtor profile missing." }, { status: 404 });
    const realtorRef = realtorSnap.docs[0].ref;
    const claimId = `CLM_${leadId}_${user.uid}`;
    const claimRef = db.collection("leadClaims").doc(claimId);
    const leadRef = db.collection("leads").doc(leadId);
    const ledgerRef = db.collection("creditLedger").doc(`CRD_${randomUUID().replace(/-/g, "").slice(0, 16)}`);
    let claim: Record<string, unknown> = {};
    let ledger: Record<string, unknown> | null = null;
    let remainingAfter = 0;

    await db.runTransaction(async tx => {
      const [leadSnap, existingClaim, realtorDoc] = await Promise.all([tx.get(leadRef), tx.get(claimRef), tx.get(realtorRef)]);
      if (!leadSnap.exists) throw new Error("LEAD_NOT_FOUND");
      if (existingClaim.exists) throw new Error("ALREADY_CLAIMED");
      if (!realtorDoc.exists) throw new Error("NO_PROFILE");
      const lead = leadSnap.data()!;
      const realtor = realtorDoc.data()!;
      if (realtor.status !== "active") throw new Error("SUSPENDED");
      if (realtor.verificationStatus !== "verified") throw new Error("NOT_VERIFIED");
      if (lead.verificationStatus !== "verified" || lead.status !== "verified") throw new Error("LEAD_NOT_VERIFIED");
      if ((lead.country || "PK") !== (realtor.country || "PK") || lead.city !== realtor.city || !realtor.areas?.includes(lead.area)) throw new Error("OUTSIDE_TERRITORY");
      if (!realtor.leadTypes?.includes(lead.type)) throw new Error("OUTSIDE_SPECIALTY");
      if (realtor.propertyTypes?.length && !realtor.propertyTypes.includes(lead.propertyType)) throw new Error("OUTSIDE_SPECIALTY");
      if ((lead.claimCount || 0) >= (lead.maxClaims || 3)) throw new Error("CLAIM_LIMIT");

      const now = new Date().toISOString();
      const subscriptionLeft = subscriptionRemaining(realtor);
      const paygBalance = Math.max(0, Number(realtor.paygLeadBalance || 0));
      const legacyBalance = Math.max(0, Number(realtor.creditsBalance || 0));
      let accessSource: "subscription" | "payg" | "legacy_credit";
      const realtorPatch: Record<string, unknown> = { updatedAt: now };

      if (subscriptionLeft > 0) {
        accessSource = "subscription";
        const usedAfter = Number(realtor.planLeadsUsed || 0) + 1;
        realtorPatch.planLeadsUsed = usedAfter;
        remainingAfter = Math.max(0, Number(realtor.planLeadCap || 0) - usedAfter);
        ledger = {
          id: ledgerRef.id,
          realtorId: realtor.id,
          realtorUid: user.uid,
          amount: -1,
          balanceAfter: remainingAfter,
          type: "subscription_lead_claim",
          referenceId: leadId,
          note: `Claimed ${leadId} from ${realtor.planId || "subscription"}`,
          createdAt: now,
        };
      } else if (paygBalance > 0) {
        accessSource = "payg";
        remainingAfter = paygBalance - 1;
        realtorPatch.paygLeadBalance = remainingAfter;
        ledger = {
          id: ledgerRef.id,
          realtorId: realtor.id,
          realtorUid: user.uid,
          amount: -1,
          balanceAfter: remainingAfter,
          type: "payg_lead_claim",
          referenceId: leadId,
          note: `Claimed ${leadId} using individual lead access`,
          createdAt: now,
        };
      } else if (legacyBalance > 0) {
        accessSource = "legacy_credit";
        remainingAfter = legacyBalance - 1;
        realtorPatch.creditsBalance = remainingAfter;
        ledger = {
          id: ledgerRef.id,
          realtorId: realtor.id,
          realtorUid: user.uid,
          amount: -1,
          balanceAfter: remainingAfter,
          type: "legacy_lead_claim",
          referenceId: leadId,
          note: `Claimed ${leadId} using beta credit`,
          createdAt: now,
        };
      } else {
        throw new Error("NO_LEAD_ACCESS");
      }

      claim = { id: claimId, leadId, realtorId: realtor.id, realtorUid: user.uid, status: "new", notes: "", creditCost: 1, accessSource, claimedAt: now, updatedAt: now };
      tx.set(claimRef, claim);
      if (ledger) tx.set(ledgerRef, ledger);
      tx.update(leadRef, { claimCount: (lead.claimCount || 0) + 1, updatedAt: now });
      tx.update(realtorRef, realtorPatch);
    });

    appendSheetRow("LeadClaims", claim).catch(console.error);
    if (ledger) appendSheetRow("CreditLedger", ledger).catch(console.error);
    return NextResponse.json({ ok: true, claimId, leadsRemaining: remainingAfter });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const map: Record<string,string> = {
      LEAD_NOT_FOUND: "Lead no longer exists.", OUTSIDE_TERRITORY: "This lead is outside your territory.",
      OUTSIDE_SPECIALTY: "This lead is outside your approved specialties.", ALREADY_CLAIMED: "You already claimed this lead.",
      CLAIM_LIMIT: "This lead has reached its claim limit.", NOT_VERIFIED: "Realtor verification is required.",
      LEAD_NOT_VERIFIED: "This lead is not currently available for claiming.", SUSPENDED: "Your realtor account is suspended.",
      NO_LEAD_ACCESS: "You have no verified-lead allowance remaining. Choose a plan or buy an individual verified lead.",
    };
    return NextResponse.json({ ok: false, error: map[message] || "Could not claim this lead." }, { status: message === "UNAUTHENTICATED" ? 401 : message === "NO_LEAD_ACCESS" ? 402 : 400 });
  }
}
