import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const db = adminDb();
    const claims = await db.collection("leadClaims").where("realtorUid", "==", user.uid).limit(100).get();
    const rows = await Promise.all(claims.docs.map(async c => {
      const claim = c.data(); const lead = await db.collection("leads").doc(claim.leadId).get();
      return { claim, lead: lead.exists ? lead.data() : null };
    }));
    return NextResponse.json({ ok: true, claimed: rows });
  } catch { return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }); }
}
