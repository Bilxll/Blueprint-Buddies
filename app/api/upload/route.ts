import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { appendSheetRow, uploadRealtorLogo } from "@/lib/google";
import { appConfig } from "@/lib/config";
import { randomUUID } from "node:crypto";

const ALLOWED = new Set(["image/jpeg","image/png","image/webp"]);
async function signatureMatches(file:File){
  const b=new Uint8Array(await file.slice(0,16).arrayBuffer());
  if(file.type==="image/jpeg") return b[0]===0xff&&b[1]===0xd8&&b[2]===0xff;
  if(file.type==="image/png") return b[0]===0x89&&b[1]===0x50&&b[2]===0x4e&&b[3]===0x47;
  if(file.type==="image/webp") return String.fromCharCode(...b.slice(0,4))==="RIFF"&&String.fromCharCode(...b.slice(8,12))==="WEBP";
  return false;
}

export async function POST(request: Request) {
  try {
    const user=await requireUser(request);
    const db=adminDb();
    const realtorSnap=await db.collection("realtors").where("uid","==",user.uid).limit(1).get();
    if(realtorSnap.empty) return NextResponse.json({ok:false,error:"Create your realtor profile before uploading a logo."},{status:403});
    const realtor=realtorSnap.docs[0].data();
    if(realtor.status!=="active") return NextResponse.json({ok:false,error:"This realtor account cannot upload files."},{status:403});

    const now=new Date();const nowIso=now.toISOString();
    const rateRef=db.collection("_rateLimits").doc(`upload_${user.uid}`);
    const rateSnap=await rateRef.get();const rate=rateSnap.exists?rateSnap.data()!:null;
    const start=rate?.windowStart?new Date(rate.windowStart).getTime():0;const inWindow=now.getTime()-start<60*60*1000;
    const count=inWindow?Number(rate?.count||0):0;
    if(count>=appConfig.uploadRateLimitCount) return NextResponse.json({ok:false,error:"Too many uploads. Try again later."},{status:429});

    const form=await request.formData(); const file=form.get("file"); const purpose=String(form.get("purpose")||"agency_logo");
    if(purpose!=="agency_logo") return NextResponse.json({ok:false,error:"Unsupported upload purpose."},{status:400});
    if(!(file instanceof File)) return NextResponse.json({ok:false,error:"File required"},{status:400});
    if(!ALLOWED.has(file.type)||file.size>4*1024*1024) return NextResponse.json({ok:false,error:"Use JPG, PNG or WEBP under 4MB."},{status:400});
    if(!(await signatureMatches(file))) return NextResponse.json({ok:false,error:"The uploaded file does not appear to be a valid image."},{status:400});

    const uploaded=await uploadRealtorLogo(file);
    if(!uploaded.id) throw new Error("DRIVE_UPLOAD_FAILED");
    const row={id:`UPL_${randomUUID().replace(/-/g,"").slice(0,16)}`,ownerUid:user.uid,realtorId:realtor.id,purpose,driveFileId:uploaded.id,name:uploaded.name||file.name,mimeType:uploaded.mimeType||file.type,size:Number(uploaded.size||file.size),createdAt:nowIso};
    await Promise.all([
      db.collection("uploads").doc(row.id).set(row),
      rateRef.set({count:count+1,windowStart:inWindow?rate?.windowStart:nowIso,updatedAt:nowIso},{merge:true}),
    ]);
    appendSheetRow("Uploads",row).catch(error=>console.error("sheet-upload",error));
    return NextResponse.json({ok:true,file:uploaded,uploadId:row.id});
  }
  catch(error){console.error("upload",error);return NextResponse.json({ok:false,error:"Upload failed. Check Drive folder permission and try again."},{status:400});}
}
