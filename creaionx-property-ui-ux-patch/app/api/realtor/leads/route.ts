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
    const realtorPublic = { id: realtor.id, fullName: realtor.fullName, agencyName: realtor.agencyName, city: realtor.city, areas: realtor.areas || [], verificationStatus: realtor.verificationStatus };
    if (realtor.verificationStatus !== "verified") return NextResponse.json({ ok: true, pendingVerification: true, realtor: realtorPublic, leads: [] });
    const leadsSnap = await db.collection("leads").where("city", "==", realtor.city).limit(100).get();
    const weight:Record<string,number>={hot:0,warm:1,future:2,needs_verification:3};
    const leads = leadsSnap.docs.map(d => d.data()).filter((l: any) => ["new", "verified"].includes(l.status) && realtor.areas?.includes(l.area) && (l.claimCount || 0) < (l.maxClaims || 3)).map((l: any) => ({
      id: l.id, type: l.type, city: l.city, area: l.area, propertyType: l.propertyType, budgetMin: l.budgetMin || 0, budgetMax: l.budgetMax || 0, size: l.size || "", bedrooms: l.bedrooms || "", paymentMode: l.paymentMode || "", timeframe: l.timeframe, temperature: l.temperature, leadScore: l.leadScore, verificationStatus: l.verificationStatus, claimCount: l.claimCount || 0, maxClaims: l.maxClaims || 3, createdAt: l.createdAt
    })).sort((a:any,b:any)=>(weight[a.temperature]??9)-(weight[b.temperature]??9)||String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
    return NextResponse.json({ ok: true, realtor: realtorPublic, leads });
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
}
