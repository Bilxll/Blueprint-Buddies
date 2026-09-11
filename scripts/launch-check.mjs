import fs from "node:fs";
import path from "node:path";

const fail=[];const warn=[];
const required=["NEXT_PUBLIC_APP_URL","NEXT_PUBLIC_SUPPORT_EMAIL","NEXT_PUBLIC_FIREBASE_API_KEY","NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN","NEXT_PUBLIC_FIREBASE_PROJECT_ID","NEXT_PUBLIC_FIREBASE_APP_ID","FIREBASE_PROJECT_ID","FIREBASE_CLIENT_EMAIL","FIREBASE_PRIVATE_KEY","GOOGLE_SHEETS_SPREADSHEET_ID","GOOGLE_DRIVE_ROOT_FOLDER_ID","ADMIN_EMAILS"];
for(const key of required){const v=String(process.env[key]||"").trim();if(!v)fail.push(`${key} is missing`);if(/YOUR[-_ ]|PASTE_NEW|example\.com/i.test(v))fail.push(`${key} still contains a placeholder`)}
const url=String(process.env.NEXT_PUBLIC_APP_URL||"");if(!url.startsWith("https://"))fail.push("NEXT_PUBLIC_APP_URL must use https:// for production");
const support=String(process.env.NEXT_PUBLIC_SUPPORT_EMAIL||"");if(!/^\S+@\S+\.\S+$/.test(support))fail.push("NEXT_PUBLIC_SUPPORT_EMAIL must be a valid email");
if(String(process.env.ALLOW_TEST_PURCHASES||"false").toLowerCase()==="true")fail.push("ALLOW_TEST_PURCHASES must be false before public production launch");
if(String(process.env.BILLING_MODE||"beta_credits")==="test_credits")fail.push("BILLING_MODE cannot be test_credits for public production");
const routes=["app/page.tsx","app/get-started/page.tsx","app/track/page.tsx","app/login/page.tsx","app/join-realtor/page.tsx","app/realtor/dashboard/page.tsx","app/realtor/settings/page.tsx","app/admin/page.tsx","app/contact/page.tsx","app/faq/page.tsx","app/privacy/page.tsx","app/terms/page.tsx","app/lead-policy/page.tsx","app/api/health/route.ts","app/api/track/route.ts"];
for(const r of routes)if(!fs.existsSync(path.resolve(r)))fail.push(`Required route/file missing: ${r}`);
if(fs.existsSync(".env.local"))warn.push(".env.local exists locally; confirm it remains gitignored");
const gitignore=fs.existsSync(".gitignore")?fs.readFileSync(".gitignore","utf8"):"";if(!gitignore.includes(".env"))warn.push(".gitignore may not ignore environment files");
console.log("BLUEPRINT BUDDIES PRODUCTION LAUNCH CHECK");
for(const w of warn)console.log(`WARN: ${w}`);
if(fail.length){for(const f of fail)console.error(`FAIL: ${f}`);console.error(`\n${fail.length} launch blocker(s) found.`);process.exit(1)}
console.log("PASS: production configuration and launch routes passed static checks.");
