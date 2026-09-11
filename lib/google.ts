import { google } from "googleapis";
import { Readable } from "node:stream";

export const SHEET_HEADERS: Record<string, string[]> = {
  Leads: ["id","type","city","area","propertyType","budgetMin","budgetMax","size","bedrooms","paymentMode","purpose","timeframe","ownerConfirmed","expectedPrice","investmentGoal","name","phone","email","temperature","leadScore","verificationStatus","status","maxClaims","claimCount","creditCost","source","campaign","contentId","utmSource","utmMedium","utmCampaign","createdAt","updatedAt","contactConsent"],
  Realtors: ["id","uid","fullName","agencyName","phone","whatsapp","email","city","areas","propertyTypes","leadTypes","experience","website","instagram","facebook","logoDriveFileId","about","verificationStatus","status","planId","subscriptionStatus","creditsBalance","createdAt","updatedAt","authProvider","termsAccepted","termsAcceptedAt"],
  LeadClaims: ["id","leadId","realtorId","realtorUid","status","notes","creditCost","claimedAt","updatedAt"],
  LeadFeedback: ["id","leadId","realtorId","valid","reason","comment","createdAt"],
  Conversions: ["id","leadId","realtorId","status","dealEstimate","propertyShown","nextFollowUp","createdAt","updatedAt","claimId","notes","eventType"],
  CreditLedger: ["id","realtorId","realtorUid","amount","balanceAfter","type","referenceId","note","createdAt"],
  Packages: ["id","name","credits","pricePkr","active","mode","createdAt","updatedAt"],
  Subscriptions: ["id","realtorId","packageId","status","mode","startedAt","renewsAt","createdAt","updatedAt"],
  Notifications: ["id","userId","type","title","message","read","createdAt"],
  AuditLog: ["id","actorUid","action","entityType","entityId","payload","createdAt"],
};

function credentials() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) throw new Error("Google service credentials are not configured.");
  return { clientEmail, privateKey };
}

function auth(scopes: string[]) {
  const { clientEmail, privateKey } = credentials();
  return new google.auth.JWT({ email: clientEmail, key: privateKey, scopes });
}

export async function appendSheetRow(sheet: keyof typeof SHEET_HEADERS, record: Record<string, unknown>) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) return false;
  const sheets = google.sheets({ version: "v4", auth: auth(["https://www.googleapis.com/auth/spreadsheets"]) });
  const headers = SHEET_HEADERS[sheet];
  const row = headers.map(h => {
    const value = record[h];
    if (Array.isArray(value) || (value && typeof value === "object")) return JSON.stringify(value);
    return value ?? "";
  });
  await sheets.spreadsheets.values.append({ spreadsheetId, range: `${sheet}!A:ZZ`, valueInputOption: "RAW", requestBody: { values: [row] } });
  return true;
}

export async function uploadToDrive(file: File, folderId?: string) {
  const drive = google.drive({ version: "v3", auth: auth(["https://www.googleapis.com/auth/drive"]) });
  const bytes = Buffer.from(await file.arrayBuffer());
  const root = folderId || process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  const response = await drive.files.create({
    requestBody: { name: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`, parents: root ? [root] : undefined },
    media: { mimeType: file.type, body: Readable.from(bytes) },
    fields: "id,name,mimeType,size,webViewLink"
  });
  return response.data;
}

export async function probeGoogleSheets() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("Spreadsheet ID missing");
  const sheets = google.sheets({ version: "v4", auth: auth(["https://www.googleapis.com/auth/spreadsheets.readonly"]) });
  const res = await sheets.spreadsheets.get({ spreadsheetId, fields: "spreadsheetId,properties.title" });
  return { id: res.data.spreadsheetId, title: res.data.properties?.title || "" };
}

export async function probeGoogleDrive() {
  const folderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!folderId) throw new Error("Drive folder ID missing");
  const drive = google.drive({ version: "v3", auth: auth(["https://www.googleapis.com/auth/drive.metadata.readonly"]) });
  const res = await drive.files.get({ fileId: folderId, fields: "id,name,mimeType" });
  return { id: res.data.id, name: res.data.name || "", mimeType: res.data.mimeType || "" };
}
