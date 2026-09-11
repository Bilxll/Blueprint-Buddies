import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { appendSheetRow } from "@/lib/google";
import { appConfig } from "@/lib/config";
import { randomUUID } from "node:crypto";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const snap = await adminDb().collection("realtors").orderBy("createdAt", "desc").limit(200).get();
    return NextResponse.json({ ok: true, realtors: snap.docs.map(d => d.data()) });
  } catch { return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }); }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin(request);
    const { realtorId, verificationStatus, status, creditAdjustment, note } = await request.json();
    if (!realtorId) return NextResponse.json({ ok:false,error:"realtorId required"},{status:400});
    if (verificationStatus !== undefined && !["verified","rejected","pending"].includes(verificationStatus)) return NextResponse.json({ ok:false,error:"Invalid verification status"},{status:400});
    if (status !== undefined && !["active","suspended"].includes(status)) return NextResponse.json({ ok:false,error:"Invalid account status"},{status:400});
    if (creditAdjustment !== undefined && (!Number.isFinite(Number(creditAdjustment)) || Math.abs(Number(creditAdjustment)) > 1000)) return NextResponse.json({ ok:false,error:"Invalid credit adjustment"},{status:400});
    const db=adminDb(); const ref=db.collection("realtors").doc(realtorId); const now=new Date().toISOString();
    let ledger: Record<string, unknown>|null=null; let auditPayload:Record<string,unknown>={};
    await db.runTransaction(async tx=>{
      const snap=await tx.get(ref); if(!snap.exists) throw new Error("NOT_FOUND"); const r=snap.data()!; const patch:any={updatedAt:now};
      if(verificationStatus!==undefined){
        patch.verificationStatus=verificationStatus;
        if(verificationStatus==="pending") { patch.status="active"; patch.subscriptionStatus="pending_verification"; }
        if(verificationStatus==="rejected") { patch.subscriptionStatus="suspended"; }
        if(verificationStatus==="verified") {
          patch.status=r.status==="suspended"?"suspended":"active";
          patch.subscriptionStatus=r.subscriptionStatus==="pending_verification"||r.subscriptionStatus==="suspended"?"beta_active":r.subscriptionStatus;
        }
        if(verificationStatus==="verified" && r.verificationStatus!=="verified" && !r.creditsGrantedAt && appConfig.defaultBetaCredits>0){
          const balanceAfter=Number(r.creditsBalance||0)+appConfig.defaultBetaCredits;
          patch.creditsBalance=balanceAfter; patch.creditsGrantedAt=now; patch.planId=r.planId||"beta";
          const ledgerRef=db.collection("creditLedger").doc(`CRD_${randomUUID().replace(/-/g,"").slice(0,16)}`);
          ledger={id:ledgerRef.id,realtorId:r.id,realtorUid:r.uid,amount:appConfig.defaultBetaCredits,balanceAfter,type:"verification_bonus",referenceId:r.id,note:"Initial beta credits",createdAt:now};
          tx.set(ledgerRef,ledger);
        }
      }
      if(status!==undefined){ patch.status=status; if(status==="suspended") patch.subscriptionStatus="suspended"; else if(r.verificationStatus==="verified") patch.subscriptionStatus=r.subscriptionStatus==="suspended"?"beta_active":r.subscriptionStatus; }
      if(creditAdjustment!==undefined){
        const amount=Number(creditAdjustment); const current=Number(patch.creditsBalance ?? r.creditsBalance ?? 0); const balanceAfter=Math.max(0,current+amount); patch.creditsBalance=balanceAfter;
        const actual=balanceAfter-current; const ledgerRef=db.collection("creditLedger").doc(`CRD_${randomUUID().replace(/-/g,"").slice(0,16)}`);
        ledger={id:ledgerRef.id,realtorId:r.id,realtorUid:r.uid,amount:actual,balanceAfter,type:"admin_adjustment",referenceId:admin.uid,note:String(note||"Admin credit adjustment"),createdAt:now};
        tx.set(ledgerRef,ledger);
      }
      auditPayload={verificationStatus,status,creditAdjustment,note}; tx.update(ref,patch);
    });
    const audit={id:`AUD_${randomUUID().replace(/-/g,"").slice(0,16)}`,actorUid:admin.uid,action:"REALTOR_UPDATED",entityType:"realtor",entityId:realtorId,payload:auditPayload,createdAt:now};
    await db.collection("auditLogs").doc(audit.id).set(audit);
    appendSheetRow("AuditLog",audit).catch(console.error); if(ledger) appendSheetRow("CreditLedger",ledger).catch(console.error);
    return NextResponse.json({ok:true});
  } catch (error) {
    const message=error instanceof Error?error.message:"";
    return NextResponse.json({ok:false,error:message==="NOT_FOUND"?"Realtor not found.":"Forbidden"},{status:message==="NOT_FOUND"?404:403});
  }
}
