import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { appendSheetRow } from "@/lib/google";
import { scoreLead } from "@/lib/lead-scoring";
import { leadSchema } from "@/lib/validation";
import { appConfig } from "@/lib/config";
import { clientIp, leadDedupKey, normalizePakistanPhone, sha256 } from "@/lib/security";
import { leadCreditCost } from "@/lib/billing";
import { randomUUID } from "node:crypto";

export async function POST(request: Request) {
  try {
    const parsed = leadSchema.parse(await request.json());
    const body = { ...parsed, phone: normalizePakistanPhone(parsed.phone), email: parsed.email?.trim().toLowerCase() || "" };
    const nowDate = new Date();
    const now = nowDate.toISOString();
    const ipHash = sha256(clientIp(request));
    const db = adminDb();
    const rateRef = db.collection("_rateLimits").doc(`lead_${ipHash}`);
    const dedupRef = db.collection("_leadDedup").doc(leadDedupKey(body, nowDate));
    const id = `LEAD_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const scoring = scoreLead(body);
    const lead = {
      ...body,
      id,
      ...scoring,
      verificationStatus: "unverified",
      status: "new",
      maxClaims: appConfig.defaultMaxClaims,
      claimCount: 0,
      creditCost: leadCreditCost(),
      createdAt: now,
      updatedAt: now,
    };

    let duplicateLeadId = "";
    await db.runTransaction(async tx => {
      const [rateSnap, dedupSnap] = await Promise.all([tx.get(rateRef), tx.get(dedupRef)]);
      const rate = rateSnap.exists ? rateSnap.data()! : null;
      const windowStart = rate?.windowStart ? new Date(rate.windowStart).getTime() : 0;
      const inWindow = nowDate.getTime() - windowStart < appConfig.leadRateLimitWindowMs;
      const count = inWindow ? Number(rate?.count || 0) : 0;
      if (count >= appConfig.leadRateLimitCount) throw new Error("RATE_LIMIT");

      if (dedupSnap.exists) {
        duplicateLeadId = String(dedupSnap.data()?.leadId || "");
        tx.set(rateRef, { count: count + 1, windowStart: inWindow ? rate?.windowStart : now, updatedAt: now }, { merge: true });
        return;
      }

      const leadRef = db.collection("leads").doc(id);
      tx.set(leadRef, lead);
      tx.set(dedupRef, { leadId: id, createdAt: now, expiresAt: new Date(nowDate.getTime() + 24 * 60 * 60 * 1000).toISOString() });
      tx.set(rateRef, { count: count + 1, windowStart: inWindow ? rate?.windowStart : now, updatedAt: now }, { merge: true });
    });

    if (duplicateLeadId) {
      return NextResponse.json({ ok: true, duplicate: true, leadId: duplicateLeadId, temperature: scoring.temperature });
    }

    appendSheetRow("Leads", lead).catch(error => console.error("sheet-lead", error));
    return NextResponse.json({ ok: true, leadId: id, temperature: scoring.temperature });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    console.error("lead-create", error);
    if (message === "RATE_LIMIT") {
      return NextResponse.json({ ok: false, error: "Too many submissions from this connection. Please wait a few minutes and try again." }, { status: 429 });
    }
    return NextResponse.json({ ok: false, error: "We couldn't submit your requirement. Please check the form and try again." }, { status: 400 });
  }
}
