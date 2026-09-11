import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { appendSheetRow } from "@/lib/google";
import { billingEnabledForTest, getBillablePlan, getBillablePlans, subscriptionRemaining, totalLeadAccessRemaining } from "@/lib/billing";
import { appConfig } from "@/lib/config";
import { randomUUID } from "node:crypto";

function addMonth(iso: string) {
  const d = new Date(iso);
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d.toISOString();
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const snap = await adminDb().collection("realtors").where("uid", "==", user.uid).limit(1).get();
    if (snap.empty) return NextResponse.json({ ok: false, error: "Realtor profile missing." }, { status: 404 });
    const r = snap.docs[0].data();
    const country = r.country || "PK";
    const plans = getBillablePlans(country);
    const testPurchases = billingEnabledForTest();
    return NextResponse.json({
      ok: true,
      mode: appConfig.billingMode,
      testPurchases,
      country,
      pricingAvailable: plans.length > 0,
      account: {
        planId: r.planId || "none",
        subscriptionStatus: r.subscriptionStatus || "none",
        planLeadCap: Number(r.planLeadCap || 0),
        planLeadsUsed: Number(r.planLeadsUsed || 0),
        subscriptionLeadsRemaining: subscriptionRemaining(r),
        paygLeadBalance: Number(r.paygLeadBalance || 0),
        legacyCreditsBalance: Number(r.creditsBalance || 0),
        totalLeadsRemaining: totalLeadAccessRemaining(r),
        planPeriodStart: r.planPeriodStart || "",
        planPeriodEnd: r.planPeriodEnd || "",
      },
      packages: plans,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    if (!billingEnabledForTest()) return NextResponse.json({ ok: false, error: "Online checkout is not enabled yet." }, { status: 403 });
    const user = await requireUser(request);
    if (user.email_verified !== true) return NextResponse.json({ ok: false, error: "Verify your email first." }, { status: 403 });
    const { packageId } = await request.json();
    const db = adminDb();
    const snap = await db.collection("realtors").where("uid", "==", user.uid).limit(1).get();
    if (snap.empty) return NextResponse.json({ ok: false, error: "Realtor profile missing." }, { status: 404 });
    const realtorRef = snap.docs[0].ref;
    const realtorData = snap.docs[0].data();
    const country = realtorData.country || "PK";
    const pkg = getBillablePlan(country, packageId);
    if (!pkg) return NextResponse.json({ ok: false, error: "This package is not available in your market." }, { status: 400 });

    const ledgerRef = db.collection("creditLedger").doc(`CRD_${randomUUID().replace(/-/g, "").slice(0,16)}`);
    const subscriptionRef = db.collection("subscriptions").doc(`SUB_${randomUUID().replace(/-/g, "").slice(0,16)}`);
    let ledger: Record<string, unknown> | null = null;
    let subscription: Record<string, unknown> = {};
    let responseAccount: Record<string, unknown> = {};

    await db.runTransaction(async tx => {
      const rs = await tx.get(realtorRef);
      const r = rs.data()!;
      if (r.status !== "active") throw new Error("SUSPENDED");
      if (r.verificationStatus !== "verified") throw new Error("NOT_VERIFIED");
      const now = new Date().toISOString();

      if (pkg.kind === "subscription") {
        const periodEnd = addMonth(now);
        subscription = {
          id: subscriptionRef.id,
          realtorId: r.id,
          country,
          packageId: pkg.id,
          status: "active_test",
          mode: "test",
          leadCap: pkg.leadCap,
          leadsUsed: 0,
          periodStart: now,
          periodEnd,
          startedAt: now,
          renewsAt: periodEnd,
          createdAt: now,
          updatedAt: now,
          externalPaymentId: "",
          note: "Test activation — no money charged",
        };
        tx.set(subscriptionRef, subscription);
        tx.update(realtorRef, {
          planId: pkg.id,
          subscriptionStatus: "active_test",
          planLeadCap: pkg.leadCap,
          planLeadsUsed: 0,
          planPeriodStart: now,
          planPeriodEnd: periodEnd,
          updatedAt: now,
        });
        responseAccount = { planId: pkg.id, planLeadCap: pkg.leadCap, planLeadsUsed: 0, subscriptionLeadsRemaining: pkg.leadCap };
      } else {
        const current = Number(r.paygLeadBalance || 0);
        const balanceAfter = current + pkg.leadCap;
        ledger = {
          id: ledgerRef.id,
          realtorId: r.id,
          realtorUid: user.uid,
          amount: pkg.leadCap,
          balanceAfter,
          type: "test_payg_purchase",
          referenceId: pkg.id,
          note: `${pkg.name} test activation — no money charged`,
          createdAt: now,
        };
        tx.set(ledgerRef, ledger);
        tx.update(realtorRef, { paygLeadBalance: balanceAfter, updatedAt: now });
        responseAccount = { paygLeadBalance: balanceAfter };
      }
    });

    if (ledger) appendSheetRow("CreditLedger", ledger).catch(console.error);
    if (Object.keys(subscription).length) appendSheetRow("Subscriptions", subscription).catch(console.error);
    return NextResponse.json({ ok: true, package: pkg, account: responseAccount, testMode: true });
  } catch (error) {
    const m = error instanceof Error ? error.message : "";
    return NextResponse.json({
      ok: false,
      error: m === "SUSPENDED" ? "Your realtor account is suspended." : m === "NOT_VERIFIED" ? "Your realtor account must be verified first." : "Could not activate this package.",
    }, { status: 400 });
  }
}
