import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { appendSheetRow } from "@/lib/google";
import { z } from "zod";

const updateSchema=z.object({
  claimId:z.string().min(5),
  status:z.enum(["new","contacted","responded","qualified","viewing_scheduled","negotiating","won","lost","invalid","no_response"]).optional(),
  notes:z.string().max(1200).optional()
}).refine(v=>v.status!==undefined||v.notes!==undefined,{message:"No changes supplied"});

async function verifiedRealtor(db: ReturnType<typeof adminDb>, uid:string){
  const snap=await db.collection("realtors").where("uid","==",uid).limit(1).get();
  if(snap.empty) throw new Error("NO_PROFILE");
  const realtor=snap.docs[0].data();
  if(realtor.verificationStatus!=="verified"||realtor.status!=="active") throw new Error("NOT_VERIFIED");
  return realtor;
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    if (user.email_verified !== true) return NextResponse.json({ ok: false, error: "Verify your email first." }, { status: 403 });
    const db = adminDb(); await verifiedRealtor(db,user.uid);
    const claims = await db.collection("leadClaims").where("realtorUid", "==", user.uid).limit(100).get();
    const rows = await Promise.all(claims.docs.map(async c => {
      const claim = c.data(); const lead = await db.collection("leads").doc(claim.leadId).get();
      return { claim, lead: lead.exists ? lead.data() : null };
    }));
    rows.sort((a:any,b:any)=>String(b.claim?.claimedAt||"").localeCompare(String(a.claim?.claimedAt||"")));
    return NextResponse.json({ ok: true, claimed: rows });
  } catch (error) {
    const m=error instanceof Error?error.message:"";
    return NextResponse.json({ ok: false, error: m==="NOT_VERIFIED"?"Realtor verification is required.":"Unauthorized" }, { status: m==="NOT_VERIFIED"?403:401 });
  }
}

export async function PATCH(request: Request){
  try{
    const user=await requireUser(request);
    if (user.email_verified !== true) return NextResponse.json({ok:false,error:"Verify your email first."},{status:403});
    const body=updateSchema.parse(await request.json());
    const db=adminDb(); await verifiedRealtor(db,user.uid);
    const ref=db.collection("leadClaims").doc(body.claimId);
    const snap=await ref.get();
    if(!snap.exists) return NextResponse.json({ok:false,error:"Claim not found."},{status:404});
    const claim=snap.data()!;
    if(claim.realtorUid!==user.uid) return NextResponse.json({ok:false,error:"You cannot update this lead."},{status:403});
    const now=new Date().toISOString();
    const patch:any={updatedAt:now};
    if(body.status!==undefined) patch.status=body.status;
    if(body.notes!==undefined) patch.notes=body.notes;
    await ref.update(patch);
    appendSheetRow("Conversions",{id:`EVT_${Date.now()}_${body.claimId}`,claimId:body.claimId,leadId:claim.leadId,realtorId:claim.realtorId,status:body.status||claim.status,notes:body.notes??claim.notes,eventType:"claim_update",createdAt:now}).catch(console.error);
    return NextResponse.json({ok:true});
  }catch(e){
    console.error("claim-update",e);
    const m=e instanceof Error?e.message:"";
    return NextResponse.json({ok:false,error:m==="NOT_VERIFIED"?"Realtor verification is required.":"Could not update this lead."},{status:m==="NOT_VERIFIED"?403:400});
  }
}
