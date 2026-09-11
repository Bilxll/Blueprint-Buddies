import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { appConfig } from "@/lib/config";
import { clientIp, normalizePhone, sha256 } from "@/lib/security";
import { trackLeadSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { leadId, phone } = trackLeadSchema.parse(await request.json());
    const db = adminDb();
    const now = new Date();
    const nowIso = now.toISOString();
    const key = sha256(clientIp(request));
    const rateRef = db.collection("_rateLimits").doc(`track_${key}`);
    const ref = db.collection("leads").doc(leadId.toUpperCase());
    const [rateSnap, leadSnap] = await Promise.all([rateRef.get(), ref.get()]);

    const rate = rateSnap.exists ? rateSnap.data()! : null;
    const start = rate?.windowStart ? new Date(rate.windowStart).getTime() : 0;
    const inWindow = now.getTime() - start < 10 * 60 * 1000;
    const count = inWindow ? Number(rate?.count || 0) : 0;
    if (count >= appConfig.trackRateLimitCount) {
      return NextResponse.json({ ok: false, error: "Too many tracking attempts. Please wait a few minutes." }, { status: 429 });
    }
    await rateRef.set({ count: count + 1, windowStart: inWindow ? rate?.windowStart : nowIso, updatedAt: nowIso }, { merge: true });

    if (!leadSnap.exists) return NextResponse.json({ ok: false, error: "Reference or phone number does not match." }, { status: 404 });
    const lead = leadSnap.data()!;
    if (normalizePhone(phone, lead.country || "PK") !== normalizePhone(String(lead.phone || ""), lead.country || "PK")) {
      return NextResponse.json({ ok: false, error: "Reference or phone number does not match." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      lead: {
        id: lead.id,
        type: lead.type,
        city: lead.city,
        area: lead.area,
        propertyType: lead.propertyType,
        timeframe: lead.timeframe,
        temperature: lead.temperature,
        verificationStatus: lead.verificationStatus,
        status: lead.status,
        claimCount: Number(lead.claimCount || 0),
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      },
    });
  } catch (error) {
    console.error("track-lead", error);
    return NextResponse.json({ ok: false, error: "Enter a valid reference and the original phone number." }, { status: 400 });
  }
}
