export type LeadType = "buy" | "sell" | "invest" | "rent";
export type LeadTemperature = "hot" | "warm" | "future" | "needs_verification";
export type LeadStatus = "new" | "verified" | "flagged" | "rejected" | "archived";
export type ClaimStatus = "new" | "contacted" | "responded" | "qualified" | "viewing_scheduled" | "negotiating" | "won" | "lost" | "invalid" | "no_response";

export interface LeadInput {
  type: LeadType;
  city: string;
  area: string;
  propertyType: string;
  budgetMin?: number;
  budgetMax?: number;
  size?: string;
  bedrooms?: string;
  paymentMode?: string;
  purpose?: string;
  timeframe: string;
  ownerConfirmed?: boolean;
  expectedPrice?: number;
  investmentGoal?: string;
  name: string;
  phone: string;
  email?: string;
  contactConsent: true;
  source?: string;
  campaign?: string;
  contentId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}
