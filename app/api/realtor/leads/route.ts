import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const db = adminDb();
    const realtorSnap = await db.collection("realtors").where("uid", "==", user.uid).limit(1).get();
    if (realtorSnap.empty) return NextResponse.json({ ok: false, error: "Complete your realtor profile first." }, { status: 404 });
    const realtor = realtorSnap.docs[0].data();
    const realtorPublic = {
      id: realtor.id, fullName: realtor.fullName, agencyName: realtor.agencyName, city: realtor.city,
      areas: realtor.areas || [], propertyTypes: realtor.propertyTypes || [], leadTypes: realtor.leadTypes || [],
      verificationStatus: realtor.verificationStatus, planId: realtor.planId || "beta",
      subscriptionStatus: realtor.subscriptionStatus || "pending_verification", creditsBalance: Number(realtor.creditsBalance || 0),
      billingMode: realtor.billingMode || process.env.BILLING_MODE || "test_credits",
    };
    if (user.email_verified !== true) return NextResponse.json({ ok: true, pendingEmailVerification: true, realtor: realtorPublic, leads: [] });
    if (realtor.verificationStatus !== "verified") return NextResponse.json({ ok: true, pendingVerification: true, realtor: realtorPublic, leads: [] });

    const leadsSnap = await db.collection("leads").where("city", "==", realtor.city).limit(150).get();
    const weight:Record<string,number>={hot:0,warm:1,future:2,needs_verification:3};
    const leads = leadsSnap.docs.map(d => d.data()).filter((l: any) =>
      l.verificationStatus === "verified" && l.status === "verified" &&
      realtor.areas?.includes(l.area) && realtor.leadTypes?.includes(l.type) &&
      (!realtor.propertyTypes?.length || realtor.propertyTypes.includes(l.propertyType)) &&
      (l.claimCount || 0) < (l.maxClaims || 3)
    ).map((l: any) => ({
      id: l.id, type: l.type, city: l.city, area: l.area, propertyType: l.propertyType,
      budgetMin: l.budgetMin || 0, budgetMax: l.budgetMax || 0, expectedPrice: l.expectedPrice || 0,
      size: l.size || "", bedrooms: l.bedrooms || "", paymentMode: l.paymentMode || "", timeframe: l.timeframe,
      temperature: l.temperature, leadScore: l.leadScore, verificationStatus: l.verificationStatus,
      claimCount: l.claimCount || 0, maxClaims: l.maxClaims || 3, creditCost: Number(l.creditCost || 1), createdAt: l.createdAt
    })).sort((a:any,b:any)=>(weight[a.temperature]??9)-(weight[b.temperature]??9)||String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
    return NextResponse.json({ ok: true, realtor: realtorPublic, leads });
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
}
