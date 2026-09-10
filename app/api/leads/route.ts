import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { appendSheetRow } from "@/lib/google";
import { scoreLead } from "@/lib/lead-scoring";
import { leadSchema } from "@/lib/validation";
import { randomUUID } from "node:crypto";

export async function POST(request: Request) {
  try {
    const body = leadSchema.parse(await request.json());
    const now = new Date().toISOString();
    const id = `LEAD_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const scoring = scoreLead(body);
    const lead = { ...body, id, ...scoring, verificationStatus: "unverified", status: "new", maxClaims: Number(process.env.DEFAULT_MAX_CLAIMS || 3), claimCount: 0, createdAt: now, updatedAt: now };
    await adminDb().collection("leads").doc(id).set(lead);
    appendSheetRow("Leads", lead).catch(console.error);
    return NextResponse.json({ ok: true, leadId: id, temperature: scoring.temperature });
  } catch (error) {
    console.error("lead-create", error);
    return NextResponse.json({ ok: false, error: "We couldn't submit your requirement. Please check the form and try again." }, { status: 400 });
  }
}
