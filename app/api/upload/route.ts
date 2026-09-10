import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { uploadToDrive } from "@/lib/google";

const ALLOWED = new Set(["image/jpeg","image/png","image/webp"]);
export async function POST(request: Request) {
  try { await requireUser(request); const form=await request.formData(); const file=form.get("file"); if(!(file instanceof File)) return NextResponse.json({ok:false,error:"File required"},{status:400}); if(!ALLOWED.has(file.type)||file.size>4*1024*1024) return NextResponse.json({ok:false,error:"Use JPG, PNG or WEBP under 4MB."},{status:400}); const uploaded=await uploadToDrive(file); return NextResponse.json({ok:true,file:uploaded}); }
  catch(error){console.error(error);return NextResponse.json({ok:false,error:"Upload failed"},{status:400});}
}
