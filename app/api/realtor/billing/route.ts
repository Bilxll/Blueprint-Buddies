import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { appendSheetRow } from "@/lib/google";
import { billingEnabledForTest, TEST_PACKAGES } from "@/lib/billing";
import { appConfig } from "@/lib/config";
import { randomUUID } from "node:crypto";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const snap = await adminDb().collection("realtors").where("uid", "==", user.uid).limit(1).get();
    if (snap.empty) return NextResponse.json({ ok: false, error: "Realtor profile missing." }, { status: 404 });
    const r = snap.docs[0].data();
    return NextResponse.json({ ok: true, mode: appConfig.billingMode, testPurchases: billingEnabledForTest(), account: { planId: r.planId || "beta", subscriptionStatus: r.subscriptionStatus || "pending_verification", creditsBalance: Number(r.creditsBalance || 0) }, packages: TEST_PACKAGES });
  } catch { return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }); }
}

export async function POST(request: Request) {
  try {
    if (!billingEnabledForTest()) return NextResponse.json({ ok: false, error: "Test purchases are disabled." }, { status: 403 });
    const user = await requireUser(request);
    if (user.email_verified !== true) return NextResponse.json({ ok: false, error: "Verify your email first." }, { status: 403 });
    const { packageId } = await request.json();
    const pkg = TEST_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return NextResponse.json({ ok: false, error: "Unknown test package." }, { status: 400 });
    const db = adminDb();
    const snap = await db.collection("realtors").where("uid", "==", user.uid).limit(1).get();
    if (snap.empty) return NextResponse.json({ ok: false, error: "Realtor profile missing." }, { status: 404 });
    const realtorRef = snap.docs[0].ref;
    const ledgerRef = db.collection("creditLedger").doc(`CRD_${randomUUID().replace(/-/g, "").slice(0,16)}`);
    const subscriptionRef = db.collection("subscriptions").doc(`SUB_${randomUUID().replace(/-/g, "").slice(0,16)}`);
    let ledger: Record<string, unknown> = {};
    let subscription: Record<string, unknown> = {};
    await db.runTransaction(async tx => {
      const rs = await tx.get(realtorRef); const r = rs.data()!;
      if (r.verificationStatus !== "verified") throw new Error("NOT_VERIFIED");
      const now = new Date().toISOString(); const balanceAfter = Number(r.creditsBalance || 0) + pkg.credits;
      ledger = { id: ledgerRef.id, realtorId: r.id, realtorUid: user.uid, amount: pkg.credits, balanceAfter, type: "test_package", referenceId: pkg.id, note: `${pkg.name} test activation`, createdAt: now };
      subscription = { id: subscriptionRef.id, realtorId: r.id, packageId: pkg.id, status: "active", mode: "test", startedAt: now, renewsAt: "", createdAt: now, updatedAt: now };
      tx.set(ledgerRef, ledger); tx.set(subscriptionRef, subscription);
      tx.update(realtorRef, { planId: pkg.id, subscriptionStatus: "active_test", creditsBalance: balanceAfter, updatedAt: now });
    });
    appendSheetRow("CreditLedger", ledger).catch(console.error); appendSheetRow("Subscriptions", subscription).catch(console.error);
    return NextResponse.json({ ok: true, creditsBalance: ledger.balanceAfter, package: pkg });
  } catch (error) {
    const m = error instanceof Error ? error.message : "";
    return NextResponse.json({ ok: false, error: m === "NOT_VERIFIED" ? "Your realtor account must be verified first." : "Could not activate test package." }, { status: 400 });
  }
}
