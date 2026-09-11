import { z } from "zod";
import { CITY_AREAS, PROPERTY_TYPES, TIMEFRAMES } from "./market";

export const leadSchema = z.object({
  type: z.enum(["buy", "sell", "invest", "rent"]),
  city: z.string().min(2).max(80),
  area: z.string().min(2).max(120),
  propertyType: z.string().min(2).max(80),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  size: z.string().max(80).optional(),
  bedrooms: z.string().max(30).optional(),
  paymentMode: z.string().max(40).optional(),
  purpose: z.string().max(100).optional(),
  timeframe: z.string().min(2).max(80),
  ownerConfirmed: z.boolean().optional(),
  expectedPrice: z.number().nonnegative().optional(),
  investmentGoal: z.string().max(100).optional(),
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(30).refine(v => v.replace(/\D/g, "").length >= 10, "Invalid phone number"),
  email: z.string().email().optional().or(z.literal("")),
  contactConsent: z.literal(true),
  source: z.string().max(80).optional(), campaign: z.string().max(120).optional(), contentId: z.string().max(120).optional(),
  utmSource: z.string().max(120).optional(), utmMedium: z.string().max(120).optional(), utmCampaign: z.string().max(120).optional()
}).superRefine((value, ctx) => {
  const areas = CITY_AREAS[value.city];
  if (!areas) ctx.addIssue({ code: "custom", path: ["city"], message: "Unsupported city" });
  else if (!areas.includes(value.area)) ctx.addIssue({ code: "custom", path: ["area"], message: "Unsupported area for this city" });
  if (!PROPERTY_TYPES.includes(value.propertyType)) ctx.addIssue({ code: "custom", path: ["propertyType"], message: "Unsupported property type" });
  if (!TIMEFRAMES.includes(value.timeframe)) ctx.addIssue({ code: "custom", path: ["timeframe"], message: "Unsupported timeframe" });
  if (value.budgetMin !== undefined && value.budgetMax !== undefined && value.budgetMin > value.budgetMax) ctx.addIssue({ code: "custom", path: ["budgetMax"], message: "Maximum budget must be greater than minimum budget" });
  if (value.type === "sell" && value.ownerConfirmed !== true) ctx.addIssue({ code: "custom", path: ["ownerConfirmed"], message: "Seller authorization is required" });
});

export const realtorSchema = z.object({
  fullName: z.string().min(2).max(100), agencyName: z.string().min(2).max(140), phone: z.string().min(10).max(30), whatsapp: z.string().min(10).max(30),
  city: z.string().refine(v => Boolean(CITY_AREAS[v]), "Unsupported city"),
  areas: z.array(z.string()).min(1), propertyTypes: z.array(z.string()).min(1), leadTypes: z.array(z.enum(["buy","sell","invest","rent"])).min(1),
  experience: z.string().max(80).optional(), website: z.string().url().optional().or(z.literal("")), instagram: z.string().max(200).optional(), facebook: z.string().max(200).optional(), about: z.string().max(800).optional(),
  logoDriveFileId: z.string().max(200).optional().or(z.literal("")),
  termsAccepted: z.literal(true)
}).superRefine((value, ctx) => {
  const allowedAreas = CITY_AREAS[value.city] || [];
  if (value.areas.some(a => !allowedAreas.includes(a))) ctx.addIssue({ code: "custom", path: ["areas"], message: "One or more territories are invalid" });
  if (value.propertyTypes.some(p => !PROPERTY_TYPES.includes(p))) ctx.addIssue({ code: "custom", path: ["propertyTypes"], message: "One or more property types are invalid" });
});
