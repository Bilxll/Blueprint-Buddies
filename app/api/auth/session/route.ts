import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(value => value.trim().toLowerCase())
    .filter(Boolean);
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const email = user.email?.toLowerCase() || "";
    const emailVerified = user.email_verified === true;

    if (email && adminEmails().includes(email)) {
      return NextResponse.json({ ok: true, role: "admin", emailVerified });
    }

    const snap = await adminDb().collection("realtors").where("uid", "==", user.uid).limit(1).get();
    if (snap.empty) {
      return NextResponse.json({ ok: true, role: "new", emailVerified });
    }

    const realtor = snap.docs[0].data();
    return NextResponse.json({
      ok: true,
      role: "realtor",
      emailVerified,
      realtor: {
        id: realtor.id,
        fullName: realtor.fullName,
        agencyName: realtor.agencyName,
        verificationStatus: realtor.verificationStatus,
        city: realtor.city,
        areas: realtor.areas || [],
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
}
