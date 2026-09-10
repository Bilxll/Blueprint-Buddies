import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try { await requireAdmin(request); const snap = await adminDb().collection("realtors").orderBy("createdAt", "desc").limit(100).get(); return NextResponse.json({ ok: true, realtors: snap.docs.map(d => d.data()) }); }
  catch { return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }); }
}

export async function PATCH(request: Request) {
  try { const admin = await requireAdmin(request); const { realtorId, verificationStatus } = await request.json(); if (!realtorId || !["verified","rejected","pending"].includes(verificationStatus)) return NextResponse.json({ ok:false,error:"Invalid request"},{status:400});
    const db=adminDb(); await db.collection("realtors").doc(realtorId).update({ verificationStatus, updatedAt:new Date().toISOString() }); await db.collection("auditLogs").add({ actorUid:admin.uid, action:"REALTOR_VERIFICATION_CHANGED", entityType:"realtor", entityId:realtorId, payload:{verificationStatus}, createdAt:new Date().toISOString() });
    return NextResponse.json({ok:true}); } catch { return NextResponse.json({ok:false,error:"Forbidden"},{status:403}); }
}
