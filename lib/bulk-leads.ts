import { getAreas, getCities, getMarket, isCountryCode, MARKET_CONFIG, PROPERTY_TYPES, TIMEFRAMES, type CountryCode } from "./market";
import { normalizePhone, sha256 } from "./security";
import { leadSchema } from "./validation";
import type { LeadInput, LeadType } from "./types";

export type BulkRowError = { row: number; field?: string; message: string };
export type ParsedBulkLead = { row: number; input: LeadInput };

const aliases: Record<string, string> = {
  country: "country", market: "country",
  type: "type", leadtype: "type", intent: "type",
  city: "city",
  area: "area", society: "area", neighborhood: "area", neighbourhood: "area",
  propertytype: "propertyType", property: "propertyType", category: "propertyType",
  budgetmin: "budgetMin", minbudget: "budgetMin", minimumbudget: "budgetMin",
  budgetmax: "budgetMax", maxbudget: "budgetMax", maximumbudget: "budgetMax", budget: "budgetMax",
  size: "size", propertysize: "size",
  bedrooms: "bedrooms", bedroom: "bedrooms", beds: "bedrooms",
  paymentmode: "paymentMode", payment: "paymentMode",
  purpose: "purpose",
  timeframe: "timeframe", timeline: "timeframe", purchasewindow: "timeframe",
  ownerconfirmed: "ownerConfirmed", owner: "ownerConfirmed", ownershipconfirmed: "ownerConfirmed",
  expectedprice: "expectedPrice", askingprice: "expectedPrice", sellerprice: "expectedPrice",
  investmentgoal: "investmentGoal", goal: "investmentGoal",
  name: "name", fullname: "name", customername: "name", clientname: "name",
  phone: "phone", mobile: "phone", mobilenumber: "phone", phonenumber: "phone", whatsapp: "phone",
  email: "email", emailaddress: "email",
  source: "source", leadsource: "source",
  campaign: "campaign",
  contentid: "contentId", adid: "contentId",
  utmsource: "utmSource", utmmedium: "utmMedium", utmcampaign: "utmCampaign",
};

function normalizedKey(value: string) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function canonicalizeRow(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row || {})) {
    const canonical = aliases[normalizedKey(key)];
    if (canonical) out[canonical] = value;
  }
  return out;
}

export function parseCountry(value: unknown, fallback: CountryCode): CountryCode {
  const raw = String(value ?? "").trim().toUpperCase();
  if (!raw) return fallback;
  if (isCountryCode(raw)) return raw;
  if (["PAKISTAN", "PAK", "PKR"].includes(raw)) return "PK";
  if (["USA", "UNITED STATES", "UNITED STATES OF AMERICA", "AMERICA"].includes(raw)) return "US";
  if (["GB", "GREAT BRITAIN", "UNITED KINGDOM", "ENGLAND", "BRITAIN"].includes(raw)) return "UK";
  return fallback;
}

function parseLeadType(value: unknown): LeadType | "" {
  const raw = String(value ?? "").trim().toLowerCase();
  if (["buy", "buyer", "purchase", "purchaser"].includes(raw)) return "buy";
  if (["sell", "seller", "vendor"].includes(raw)) return "sell";
  if (["invest", "investor", "investment"].includes(raw)) return "invest";
  if (["rent", "renter", "rental", "tenant", "lease"].includes(raw)) return "rent";
  return "";
}

function matchInsensitive(value: unknown, allowed: string[]) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const hit = allowed.find(item => item.toLowerCase() === raw.toLowerCase());
  return hit || raw;
}

function matchPropertyType(value: unknown) {
  return matchInsensitive(value, PROPERTY_TYPES);
}

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  const raw = String(value ?? "").trim().toLowerCase();
  return ["true", "yes", "y", "1", "confirmed", "owner"].includes(raw);
}

export function parseMoney(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value);
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return undefined;
  const clean = raw.replace(/,/g, "").replace(/(?:pkr|usd|gbp|rs\.?|₨|\$|£)/gi, "").trim();
  const match = clean.match(/(-?\d+(?:\.\d+)?)\s*(crore|crores|cr|lakh|lakhs|lac|lacs|million|mn|m|thousand|k)?/i);
  if (!match) return undefined;
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n < 0) return undefined;
  const unit = (match[2] || "").toLowerCase();
  const multiplier = ["crore", "crores", "cr"].includes(unit) ? 10_000_000
    : ["lakh", "lakhs", "lac", "lacs"].includes(unit) ? 100_000
    : ["million", "mn", "m"].includes(unit) ? 1_000_000
    : ["thousand", "k"].includes(unit) ? 1_000 : 1;
  return Math.round(n * multiplier);
}

function parseTimeframe(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const exact = TIMEFRAMES.find(item => item.toLowerCase() === raw.toLowerCase());
  if (exact) return exact;
  const k = raw.toLowerCase().replace(/[–—]/g, "-");
  if (/30\s*days|0\s*-\s*30|under\s*(a\s*)?month|within\s*(a\s*)?month|immediate|asap/.test(k)) return "Within 30 days";
  if (/1\s*-\s*3|1\s*to\s*3|1\s*3\s*months?/.test(k)) return "1–3 months";
  if (/3\s*-\s*6|3\s*to\s*6/.test(k)) return "3–6 months";
  if (/6\s*-\s*12|6\s*to\s*12|within\s*(a\s*)?year/.test(k)) return "6–12 months";
  if (/explor|research|not sure|future/.test(k)) return "Just exploring";
  return raw;
}

export function normalizeBulkLead(
  rawRow: Record<string, unknown>,
  rowNumber: number,
  options: { defaultCountry: CountryCode; source: string; campaign?: string },
): { lead?: ParsedBulkLead; errors: BulkRowError[] } {
  const row = canonicalizeRow(rawRow);
  const country = parseCountry(row.country, options.defaultCountry);
  const city = matchInsensitive(row.city, getCities(country));
  const area = matchInsensitive(row.area, city ? getAreas(country, city) : []);
  const type = parseLeadType(row.type);
  const propertyType = matchPropertyType(row.propertyType);
  const input = {
    country,
    type,
    city,
    area,
    propertyType,
    budgetMin: parseMoney(row.budgetMin),
    budgetMax: parseMoney(row.budgetMax),
    size: String(row.size ?? "").trim() || undefined,
    bedrooms: String(row.bedrooms ?? "").trim() || undefined,
    paymentMode: String(row.paymentMode ?? "").trim() || undefined,
    purpose: String(row.purpose ?? "").trim() || undefined,
    timeframe: parseTimeframe(row.timeframe),
    ownerConfirmed: type === "sell" ? parseBoolean(row.ownerConfirmed) : undefined,
    expectedPrice: parseMoney(row.expectedPrice),
    investmentGoal: String(row.investmentGoal ?? "").trim() || undefined,
    name: String(row.name ?? "").trim(),
    phone: normalizePhone(String(row.phone ?? ""), country),
    email: String(row.email ?? "").trim().toLowerCase(),
    contactConsent: true as const,
    source: String(row.source ?? options.source).trim() || options.source,
    campaign: String(row.campaign ?? options.campaign ?? "").trim() || undefined,
    contentId: String(row.contentId ?? "").trim() || undefined,
    utmSource: String(row.utmSource ?? "").trim() || undefined,
    utmMedium: String(row.utmMedium ?? "").trim() || undefined,
    utmCampaign: String(row.utmCampaign ?? "").trim() || undefined,
  };

  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      errors: parsed.error.issues.map(issue => ({ row: rowNumber, field: String(issue.path[0] ?? ""), message: issue.message })),
    };
  }
  return { lead: { row: rowNumber, input: parsed.data }, errors: [] };
}

export function bulkLeadFingerprint(input: Pick<LeadInput, "country" | "phone" | "type" | "city" | "area">) {
  return sha256(`${input.country}|${normalizePhone(input.phone, input.country)}|${input.type}|${input.city.trim().toLowerCase()}|${input.area.trim().toLowerCase()}`);
}

export function marketExample(country: CountryCode) {
  const market = getMarket(country);
  const city = market.defaultCity;
  return { city, area: market.cities[city]?.[0] || "Other" };
}

export function bulkTemplateCsv() {
  const headers = ["country","type","city","area","propertyType","budgetMin","budgetMax","size","bedrooms","paymentMode","purpose","timeframe","ownerConfirmed","expectedPrice","investmentGoal","name","phone","email","source","campaign"];
  const rows = [
    ["PK","buy","Karachi","DHA","House","20000000","30000000","500 sq yd","4","Cash","Primary residence","Within 30 days","","","","Example Buyer","03001234567","buyer@example.com","bulk-import","September outreach"],
    ["PK","sell","Karachi","Clifton","Apartment","","","1800 sq ft","3","","Sell property","1–3 months","TRUE","45000000","","Example Seller","03007654321","seller@example.com","bulk-import","September outreach"],
  ];
  const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [headers, ...rows].map(row => row.map(escape).join(",")).join("\n");
}
