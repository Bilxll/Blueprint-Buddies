import { z } from "zod";

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
  phone: z.string().min(10).max(30),
  email: z.string().email().optional().or(z.literal("")),
  contactConsent: z.literal(true),
  source: z.string().max(80).optional(), campaign: z.string().max(120).optional(), contentId: z.string().max(120).optional(),
  utmSource: z.string().max(120).optional(), utmMedium: z.string().max(120).optional(), utmCampaign: z.string().max(120).optional()
});

export const realtorSchema = z.object({
  fullName: z.string().min(2).max(100), agencyName: z.string().min(2).max(140), phone: z.string().min(10).max(30), whatsapp: z.string().min(10).max(30),
  city: z.string().min(2), areas: z.array(z.string()).min(1), propertyTypes: z.array(z.string()).min(1), leadTypes: z.array(z.enum(["buy","sell","invest","rent"])).min(1),
  experience: z.string().max(80).optional(), website: z.string().url().optional().or(z.literal("")), instagram: z.string().max(200).optional(), facebook: z.string().max(200).optional(), about: z.string().max(800).optional(),
  termsAccepted: z.literal(true)
});
