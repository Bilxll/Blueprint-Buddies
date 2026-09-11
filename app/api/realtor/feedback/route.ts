import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { appendSheetRow } from "@/lib/google";
import { z } from "zod";

const schema=z.object({leadId:z.string().min(5),valid:z.boolean(),reason:z.string().max(120).optional(),comment:z.string().max(800).optional()});
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    if (user.email_verified !== true) return NextResponse.json({ ok: false, error: "Verify your email first." }, { status: 403 });
    const { leadId, valid, reason, comment } = schema.parse(await request.json());
    const db = adminDb();
    const realtorSnap = await db.collection("realtors").where("uid", "==", user.uid).limit(1).get();
    if (realtorSnap.empty) throw new Error("NO_PROFILE");
    const realtor = realtorSnap.docs[0].data();
    if(realtor.verificationStatus!=="verified"||realtor.status!=="active") return NextResponse.json({ok:false,error:"Realtor verification is required."},{status:403});
    const claim = await db.collection("leadClaims").where("leadId", "==", leadId).where("realtorUid", "==", user.uid).limit(1).get();
    if (claim.empty) return NextResponse.json({ ok: false, error: "You can only review leads you claimed." }, { status: 403 });
    const id=`FDB_${leadId}_${realtor.id}`;
    const now=new Date().toISOString();
    const previous=await db.collection("leadFeedback").doc(id).get();
    const row = { id, leadId, realtorId: realtor.id, valid, reason: reason || "", comment: comment || "", createdAt: previous.data()?.createdAt || now, updatedAt: now };
    await db.collection("leadFeedback").doc(id).set(row,{merge:true});
    appendSheetRow("LeadFeedback", row).catch(console.error);
    return NextResponse.json({ ok: true, updated: previous.exists });
  } catch { return NextResponse.json({ ok: false, error: "Could not submit feedback." }, { status: 400 }); }
}
