import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { appendSheetRow, appendSheetRows } from "@/lib/google";
import { appConfig } from "@/lib/config";
import { leadCreditCost } from "@/lib/billing";
import { scoreLead } from "@/lib/lead-scoring";
import { bulkLeadFingerprint, normalizeBulkLead } from "@/lib/bulk-leads";
import { leadDedupKey } from "@/lib/security";
import { isCountryCode, type CountryCode } from "@/lib/market";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_ROWS = 2000;

function readRows(buffer: Buffer, fileName: string) {
  const workbook = XLSX.read(buffer, { type: "buffer", raw: false, cellDates: false });
  const first = workbook.SheetNames[0];
  if (!first) throw new Error("The file does not contain a worksheet.");
  const sheet = workbook.Sheets[first];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });
  if (!rows.length) throw new Error("The file has no lead rows.");
  if (rows.length > MAX_ROWS) throw new Error(`Import files are limited to ${MAX_ROWS} rows at a time.`);
  return { rows, sheetName: first, fileName };
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);
    const form = await request.formData();
    const file = form.get("file");
    const mode = String(form.get("mode") || "preview");
    const defaultCountryRaw = String(form.get("defaultCountry") || "PK").toUpperCase();
    const defaultCountry: CountryCode = isCountryCode(defaultCountryRaw) ? defaultCountryRaw : "PK";
    const source = String(form.get("source") || "bulk-import").trim().slice(0, 80) || "bulk-import";
    const campaign = String(form.get("campaign") || "").trim().slice(0, 120);
    const consentConfirmed = String(form.get("consentConfirmed") || "false") === "true";

    if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "Choose a CSV or Excel file." }, { status: 400 });
    if (file.size <= 0 || file.size > MAX_FILE_BYTES) return NextResponse.json({ ok: false, error: "File must be smaller than 8 MB." }, { status: 400 });
    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) return NextResponse.json({ ok: false, error: "Only .csv, .xlsx, and .xls files are supported." }, { status: 400 });
    if (mode === "import" && !consentConfirmed) return NextResponse.json({ ok: false, error: "Confirm that these contacts may be shared with matched realtors before importing." }, { status: 400 });

    const parsedFile = readRows(Buffer.from(await file.arrayBuffer()), file.name);
    const valid: Array<{ row: number; input: any }> = [];
    const errors: Array<{ row: number; field?: string; message: string }> = [];
    for (let i = 0; i < parsedFile.rows.length; i++) {
      const result = normalizeBulkLead(parsedFile.rows[i], i + 2, { defaultCountry, source, campaign });
      if (result.lead) valid.push(result.lead);
      if (result.errors.length) errors.push(...result.errors);
    }

    const preview = valid.slice(0, 40).map(({ row, input }) => ({
      row, country: input.country, type: input.type, city: input.city, area: input.area,
      propertyType: input.propertyType, name: input.name, phone: input.phone,
      budgetMin: input.budgetMin ?? "", budgetMax: input.budgetMax ?? "", expectedPrice: input.expectedPrice ?? "",
      timeframe: input.timeframe,
    }));

    if (mode !== "import") {
      return NextResponse.json({
        ok: true,
        mode: "preview",
        fileName: file.name,
        sheetName: parsedFile.sheetName,
        totalRows: parsedFile.rows.length,
        validRows: valid.length,
        invalidRows: parsedFile.rows.length - valid.length,
        preview,
        errors: errors.slice(0, 150),
      });
    }

    if (!valid.length) return NextResponse.json({ ok: false, error: "No valid rows are available to import.", errors: errors.slice(0, 150) }, { status: 400 });

    const db = adminDb();
    const existingSnap = await db.collection("leads").orderBy("createdAt", "desc").limit(5000).get();
    const existingFingerprints = new Set<string>();
    for (const doc of existingSnap.docs) {
      const data = doc.data() as any;
      if (data.country && data.phone && data.type && data.city && data.area) {
        existingFingerprints.add(bulkLeadFingerprint(data));
      }
    }

    const importId = `IMPORT_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const now = new Date().toISOString();
    const seen = new Set<string>();
    const toImport: any[] = [];
    let duplicates = 0;

    for (const item of valid) {
      const fingerprint = bulkLeadFingerprint(item.input);
      if (seen.has(fingerprint) || existingFingerprints.has(fingerprint)) { duplicates++; continue; }
      seen.add(fingerprint);
      const id = `LEAD_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
      const scoring = scoreLead(item.input);
      toImport.push({
        ...item.input,
        id,
        ...scoring,
        verificationStatus: "unverified",
        status: "new",
        maxClaims: appConfig.defaultMaxClaims,
        claimCount: 0,
        creditCost: leadCreditCost(),
        importId,
        importSource: "admin-bulk",
        importedBy: admin.uid,
        importedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    for (let offset = 0; offset < toImport.length; offset += 200) {
      const chunk = toImport.slice(offset, offset + 200);
      const batch = db.batch();
      for (const lead of chunk) {
        batch.set(db.collection("leads").doc(lead.id), lead);
        batch.set(db.collection("_leadDedup").doc(leadDedupKey(lead, new Date())), { leadId: lead.id, createdAt: now, importId });
      }
      await batch.commit();
    }

    if (toImport.length) await appendSheetRows("Leads", toImport).catch(error => console.error("sheet-bulk-leads", error));

    const summary = {
      id: importId,
      fileName: file.name,
      sheetName: parsedFile.sheetName,
      source,
      defaultCountry,
      campaign,
      totalRows: parsedFile.rows.length,
      validRows: valid.length,
      importedRows: toImport.length,
      duplicateRows: duplicates,
      invalidRows: parsedFile.rows.length - valid.length,
      actorUid: admin.uid,
      createdAt: now,
    };
    await db.collection("bulkImports").doc(importId).set(summary);
    await appendSheetRow("BulkImports", summary).catch(error => console.error("sheet-bulk-import", error));
    const audit = { id: `AUD_${randomUUID().replace(/-/g, "").slice(0, 16)}`, actorUid: admin.uid, action: "BULK_LEADS_IMPORTED", entityType: "bulkImport", entityId: importId, payload: summary, createdAt: now };
    await db.collection("auditLogs").doc(audit.id).set(audit);
    appendSheetRow("AuditLog", audit).catch(console.error);

    return NextResponse.json({
      ok: true,
      mode: "import",
      importId,
      totalRows: parsedFile.rows.length,
      validRows: valid.length,
      importedRows: toImport.length,
      duplicateRows: duplicates,
      invalidRows: parsedFile.rows.length - valid.length,
      errors: errors.slice(0, 150),
    });
  } catch (error) {
    console.error("bulk-lead-import", error);
    const message = error instanceof Error ? error.message : "Could not process the file.";
    if (message === "FORBIDDEN" || message === "UNAUTHENTICATED") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ ok: false, error: message || "Could not process the file." }, { status: 400 });
  }
}
