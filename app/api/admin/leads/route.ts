import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try { await requireAdmin(request); const snap=await adminDb().collection("leads").orderBy("createdAt","desc").limit(150).get(); return NextResponse.json({ok:true,leads:snap.docs.map(d=>d.data())}); }
  catch { return NextResponse.json({ok:false,error:"Forbidden"},{status:403}); }
}
export async function PATCH(request: Request) {
  try { const admin=await requireAdmin(request); const { leadId, status, verificationStatus, maxClaims }=await request.json(); if(!leadId) return NextResponse.json({ok:false,error:"leadId required"},{status:400}); const patch:any={updatedAt:new Date().toISOString()}; if(status)patch.status=status;if(verificationStatus)patch.verificationStatus=verificationStatus;if(Number.isFinite(maxClaims))patch.maxClaims=maxClaims; const db=adminDb(); await db.collection("leads").doc(leadId).update(patch); await db.collection("auditLogs").add({actorUid:admin.uid,action:"LEAD_UPDATED",entityType:"lead",entityId:leadId,payload:patch,createdAt:new Date().toISOString()}); return NextResponse.json({ok:true}); }
  catch{return NextResponse.json({ok:false,error:"Forbidden"},{status:403});}
}
