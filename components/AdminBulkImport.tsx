"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, FileSpreadsheet, LogOut, ShieldCheck, UploadCloud, XCircle } from "lucide-react";
import { firebaseAuth } from "@/lib/firebase-client";
import { BrutalistSelect } from "@/components/BrutalistSelect";

const countryOptions = [
  { value: "PK", label: "PAKISTAN" },
  { value: "US", label: "USA" },
  { value: "UK", label: "UNITED KINGDOM" },
];

type Result = {
  mode: "preview" | "import";
  fileName?: string;
  sheetName?: string;
  importId?: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  importedRows?: number;
  duplicateRows?: number;
  preview?: any[];
  errors?: { row: number; field?: string; message: string }[];
};

export function AdminBulkImport() {
  const [file, setFile] = useState<File | null>(null);
  const [defaultCountry, setDefaultCountry] = useState("PK");
  const [source, setSource] = useState("bulk-import");
  const [campaign, setCampaign] = useState("");
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState<"preview" | "import" | "">("");
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => onAuthStateChanged(firebaseAuth, user => { if (!user) location.href = "/login"; }), []);

  async function token() {
    const user = firebaseAuth.currentUser;
    if (!user) throw new Error("Sign in again to continue.");
    return user.getIdToken(true);
  }

  async function submit(mode: "preview" | "import") {
    if (!file) { setError("Choose a CSV or Excel file first."); return; }
    if (mode === "import" && !consentConfirmed) { setError("Confirm that the imported contacts may be shared with matched realtors."); return; }
    setBusy(mode); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("mode", mode);
      fd.append("defaultCountry", defaultCountry);
      fd.append("source", source.trim() || "bulk-import");
      fd.append("campaign", campaign.trim());
      fd.append("consentConfirmed", String(consentConfirmed));
      const response = await fetch("/api/admin/bulk-leads", { method: "POST", headers: { authorization: `Bearer ${await token()}` }, body: fd });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not process the file.");
      setResult(data);
    } catch (e: any) {
      setError(e?.message || "Could not process the file.");
    } finally { setBusy(""); }
  }

  function choose(next: File | null) {
    if (!next) return;
    if (!/\.(csv|xlsx|xls)$/i.test(next.name)) { setError("Use a .csv, .xlsx, or .xls file."); return; }
    setFile(next); setResult(null); setError("");
  }

  function downloadTemplate() {
    const headers = ["country","type","city","area","propertyType","budgetMin","budgetMax","size","bedrooms","paymentMode","purpose","timeframe","ownerConfirmed","expectedPrice","investmentGoal","name","phone","email","source","campaign"];
    const example = ["PK","buy","Karachi","DHA","House","20000000","30000000","500 sq yd","4","Cash","Primary residence","Within 30 days","","","","Example Buyer","03001234567","buyer@example.com","bulk-import","September outreach"];
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, example].map(row => row.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "blueprint-buddies-lead-import-template.csv"; a.click(); URL.revokeObjectURL(url);
  }

  function downloadErrors() {
    if (!result?.errors?.length) return;
    const rows = [["row","field","message"], ...result.errors.map(e => [String(e.row), e.field || "", e.message])];
    const csv = rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "blueprint-buddies-import-errors.csv"; a.click(); URL.revokeObjectURL(url);
  }

  const canImport = Boolean(result?.mode === "preview" && result.validRows > 0 && file);
  const successRate = useMemo(() => result?.totalRows ? Math.round((result.validRows / result.totalRows) * 100) : 0, [result]);

  return <div className="portalShell adminPortal">
    <header className="portalTopbar"><a className="portalBrand" href="/">BLUEPRINT <span>BUDDIES</span></a><div><span className="portalIdentity"><ShieldCheck size={15}/> OPERATIONS</span><button onClick={() => signOut(firebaseAuth).then(() => location.href = "/")}><LogOut size={16}/> LOG OUT</button></div></header>
    <main className="adminShell bulkImportShell">
      <header className="adminHero"><div><p className="eyebrow">OPERATIONS / LEAD INGESTION</p><h1>BULK<br/><span>IMPORT.</span></h1><p className="bulkIntro">Upload qualified lead lists into the same verification pipeline used by website submissions. Nothing goes live to realtors until your team verifies it.</p></div><a className="outlineAction" href="/admin"><ArrowLeft size={16}/> BACK TO ADMIN</a></header>

      <section className="bulkImportGrid">
        <div className="bulkImportPanel">
          <div className="sectionLine"><div><p className="eyebrow">01 / SOURCE FILE</p><h2>UPLOAD LEADS</h2></div><button className="outlineAction smallAction" onClick={downloadTemplate}><Download size={15}/> CSV TEMPLATE</button></div>

          <button type="button" className={`bulkDropzone ${drag ? "isDragging" : ""}`} onClick={() => inputRef.current?.click()} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); choose(e.dataTransfer.files?.[0] || null); }}>
            <input ref={inputRef} hidden type="file" accept=".csv,.xlsx,.xls" onChange={e => choose(e.target.files?.[0] || null)}/>
            <UploadCloud size={30}/><strong>{file ? file.name : "DROP CSV / EXCEL HERE"}</strong><span>{file ? `${(file.size / 1024).toFixed(0)} KB · click to replace` : "or click to choose a file · maximum 8 MB · 2,000 rows"}</span>
          </button>

          <div className="bulkSettingsGrid">
            <label><span>DEFAULT COUNTRY</span><BrutalistSelect value={defaultCountry} onChange={setDefaultCountry} options={countryOptions} ariaLabel="Default country"/></label>
            <label><span>LEAD SOURCE</span><input value={source} onChange={e => setSource(e.target.value)} placeholder="facebook, call-center, partner, bulk-import"/></label>
            <label className="bulkWide"><span>CAMPAIGN / BATCH NAME <em>OPTIONAL</em></span><input value={campaign} onChange={e => setCampaign(e.target.value)} placeholder="September Karachi buyer list"/></label>
          </div>

          <label className="bulkConsent"><input type="checkbox" checked={consentConfirmed} onChange={e => setConsentConfirmed(e.target.checked)}/><span><strong>CONTACT-SHARING CONFIRMATION</strong>I confirm these contacts were collected with permission to be contacted and may be shared with matched realtors for the stated property requirement.</span></label>

          {error && <div className="bulkError"><XCircle size={18}/><span>{error}</span></div>}
          <div className="bulkActions"><button className="outlineAction" disabled={!file || Boolean(busy)} onClick={() => submit("preview")}><FileSpreadsheet size={16}/>{busy === "preview" ? "VALIDATING…" : "PREVIEW & VALIDATE"}</button><button className="primaryAction" disabled={!canImport || !consentConfirmed || Boolean(busy)} onClick={() => submit("import")}><UploadCloud size={16}/>{busy === "import" ? "IMPORTING…" : "IMPORT VALID ROWS"}</button></div>
        </div>

        <aside className="bulkGuide">
          <p className="eyebrow">IMPORT RULES</p><h3>KEEP THE DATA CLEAN.</h3>
          <div><span>01</span><p><strong>Country + market</strong>Use PK, US or UK and supported launch cities/areas. If country is blank, the default market is used.</p></div>
          <div><span>02</span><p><strong>Intent</strong>Lead type can be Buyer/Buy, Seller/Sell, Investor/Invest or Renter/Rent.</p></div>
          <div><span>03</span><p><strong>Money</strong>Plain numbers work, plus values like 2 crore, 50 lakh, 500k and 1.2m.</p></div>
          <div><span>04</span><p><strong>Verification</strong>Imported rows enter as UNVERIFIED. Admin verification is still required before marketplace access.</p></div>
          <div><span>05</span><p><strong>Duplicates</strong>Matching contact + country + intent + city + area records are skipped automatically.</p></div>
        </aside>
      </section>

      {result && <section className="bulkResults">
        <div className="sectionLine"><div><p className="eyebrow">02 / {result.mode === "import" ? "IMPORT COMPLETE" : "VALIDATION RESULT"}</p><h2>{result.mode === "import" ? "BATCH RESULT" : "PREVIEW"}</h2></div>{result.importId && <span>{result.importId}</span>}</div>
        <div className="bulkStats"><article><span>TOTAL ROWS</span><strong>{result.totalRows}</strong></article><article><span>VALID</span><strong>{result.validRows}</strong><small>{successRate}% pass rate</small></article><article><span>INVALID</span><strong>{result.invalidRows}</strong></article><article><span>{result.mode === "import" ? "IMPORTED" : "READY"}</span><strong>{result.mode === "import" ? result.importedRows || 0 : result.validRows}</strong>{result.mode === "import" && <small>{result.duplicateRows || 0} duplicates skipped</small>}</article></div>

        {result.preview?.length ? <div className="bulkPreviewTable"><div className="bulkPreviewHead"><span>ROW</span><span>MARKET</span><span>TYPE</span><span>CONTACT</span><span>REQUIREMENT</span><span>TIMEFRAME</span></div>{result.preview.map((row:any) => <div className="bulkPreviewRow" key={`${row.row}-${row.phone}`}><span>{row.row}</span><span>{row.country}<small>{row.city} · {row.area}</small></span><span>{String(row.type).toUpperCase()}</span><span>{row.name}<small>{row.phone}</small></span><span>{row.propertyType}<small>{row.expectedPrice ? `Expected ${Number(row.expectedPrice).toLocaleString()}` : row.budgetMax ? `Up to ${Number(row.budgetMax).toLocaleString()}` : "Budget supplied"}</small></span><span>{row.timeframe}</span></div>)}</div> : null}

        {result.errors?.length ? <div className="bulkErrorList"><div className="bulkErrorHeader"><div><AlertTriangle size={18}/><strong>{result.errors.length} VALIDATION ISSUE{result.errors.length === 1 ? "" : "S"} SHOWN</strong></div><button className="outlineAction smallAction" onClick={downloadErrors}><Download size={14}/> ERROR CSV</button></div>{result.errors.slice(0,60).map((e,index) => <div key={`${e.row}-${index}`}><span>ROW {e.row}</span><strong>{e.field || "row"}</strong><p>{e.message}</p></div>)}</div> : <div className="bulkAllGood"><CheckCircle2 size={20}/><strong>NO VALIDATION ERRORS IN THIS BATCH.</strong></div>}
      </section>}
    </main>
  </div>;
}
