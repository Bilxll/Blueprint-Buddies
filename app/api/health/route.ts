import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ status: "ok", firebaseConfigured: Boolean(process.env.FIREBASE_PROJECT_ID), sheetsConfigured: Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID), driveConfigured: Boolean(process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID), version: "0.1.0", timestamp: new Date().toISOString() }); }
