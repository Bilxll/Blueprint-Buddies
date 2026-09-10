import { google } from "googleapis";
import { Readable } from "node:stream";

const SHEET_HEADERS: Record<string, string[]> = {
  Leads: ["id","type","city","area","propertyType","budgetMin","budgetMax","size","bedrooms","paymentMode","purpose","timeframe","ownerConfirmed","expectedPrice","investmentGoal","name","phone","email","temperature","leadScore","verificationStatus","status","maxClaims","claimCount","source","campaign","contentId","utmSource","utmMedium","utmCampaign","createdAt","updatedAt","contactConsent"],
  Realtors: ["id","uid","fullName","agencyName","phone","whatsapp","email","city","areas","propertyTypes","leadTypes","experience","website","instagram","facebook","logoDriveFileId","about","verificationStatus","status","createdAt","updatedAt","authProvider","termsAccepted","termsAcceptedAt"],
  LeadClaims: ["id","leadId","realtorId","realtorUid","status","notes","claimedAt","updatedAt"],
  LeadFeedback: ["id","leadId","realtorId","valid","reason","comment","createdAt"],
  Conversions: ["id","leadId","realtorId","status","dealEstimate","propertyShown","nextFollowUp","createdAt","updatedAt","claimId","notes","eventType"],
  Notifications: ["id","userId","type","title","message","read","createdAt"],
  AuditLog: ["id","actorUid","action","entityType","entityId","payload","createdAt"],
};

function credentials() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) throw new Error("Google service credentials are not configured.");
  return { clientEmail, privateKey };
}

function auth(scopes: string[]) {
  const { clientEmail, privateKey } = credentials();
  return new google.auth.JWT({ email: clientEmail, key: privateKey, scopes });
}

export async function appendSheetRow(sheet: keyof typeof SHEET_HEADERS, record: Record<string, unknown>) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) return;
  const sheets = google.sheets({ version: "v4", auth: auth(["https://www.googleapis.com/auth/spreadsheets"]) });
  const headers = SHEET_HEADERS[sheet];
  const row = headers.map(h => {
    const value = record[h];
    if (Array.isArray(value) || (value && typeof value === "object")) return JSON.stringify(value);
    return value ?? "";
  });
  await sheets.spreadsheets.values.append({ spreadsheetId, range: `${sheet}!A:ZZ`, valueInputOption: "RAW", requestBody: { values: [row] } });
}

export async function uploadToDrive(file: File, folderId?: string) {
  const drive = google.drive({ version: "v3", auth: auth(["https://www.googleapis.com/auth/drive.file"]) });
  const bytes = Buffer.from(await file.arrayBuffer());
  const root = folderId || process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  const response = await drive.files.create({
    requestBody: { name: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`, parents: root ? [root] : undefined },
    media: { mimeType: file.type, body: Readable.from(bytes) },
    fields: "id,name,mimeType,size"
  });
  return response.data;
}
