import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { uploadToDrive } from "@/lib/google";

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
    await requireUser(request);
    const form=await request.formData(); const file=form.get("file");
    if(!(file instanceof File)) return NextResponse.json({ok:false,error:"File required"},{status:400});
    if(!ALLOWED.has(file.type)||file.size>4*1024*1024) return NextResponse.json({ok:false,error:"Use JPG, PNG or WEBP under 4MB."},{status:400});
    if(!(await signatureMatches(file))) return NextResponse.json({ok:false,error:"The uploaded file does not appear to be a valid image."},{status:400});
    const uploaded=await uploadToDrive(file);
    return NextResponse.json({ok:true,file:uploaded});
  }
  catch(error){console.error("upload",error);return NextResponse.json({ok:false,error:"Upload failed. Check Drive configuration and try again."},{status:400});}
}
