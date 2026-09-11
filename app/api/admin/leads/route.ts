import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { appendSheetRow } from "@/lib/google";
import { randomUUID } from "node:crypto";

export async function GET(request: Request) {
  try { await requireAdmin(request); const snap=await adminDb().collection("leads").orderBy("createdAt","desc").limit(200).get(); return NextResponse.json({ok:true,leads:snap.docs.map(d=>d.data())}); }
  catch { return NextResponse.json({ok:false,error:"Forbidden"},{status:403}); }
}
export async function PATCH(request: Request) {
  try {
    const admin=await requireAdmin(request); const { leadId, status, verificationStatus, maxClaims, creditCost }=await request.json();
    if(!leadId) return NextResponse.json({ok:false,error:"leadId required"},{status:400});
    if(status!==undefined && !["new","verified","flagged","rejected","archived"].includes(status)) return NextResponse.json({ok:false,error:"Invalid lead status"},{status:400});
    if(verificationStatus!==undefined && !["unverified","verified","rejected","flagged"].includes(verificationStatus)) return NextResponse.json({ok:false,error:"Invalid verification status"},{status:400});
    const patch:any={updatedAt:new Date().toISOString()};
    if(status!==undefined)patch.status=status;if(verificationStatus!==undefined)patch.verificationStatus=verificationStatus;
    if(Number.isFinite(Number(maxClaims)))patch.maxClaims=Math.max(1,Math.min(20,Number(maxClaims)));
    if(Number.isFinite(Number(creditCost)))patch.creditCost=Math.max(1,Math.min(100,Number(creditCost)));
    const db=adminDb(); await db.collection("leads").doc(leadId).update(patch);
    const audit={id:`AUD_${randomUUID().replace(/-/g,"").slice(0,16)}`,actorUid:admin.uid,action:"LEAD_UPDATED",entityType:"lead",entityId:leadId,payload:patch,createdAt:new Date().toISOString()};
    await db.collection("auditLogs").doc(audit.id).set(audit); appendSheetRow("AuditLog",audit).catch(console.error);
    return NextResponse.json({ok:true});
  }
  catch{return NextResponse.json({ok:false,error:"Forbidden"},{status:403});}
}
